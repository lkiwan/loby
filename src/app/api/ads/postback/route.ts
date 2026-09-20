import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateGameToken, redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { creditBalance } from '@/lib/ledger';
import { getConfig } from '@/lib/config';
import { bumpMission } from '@/lib/missions';
import { casablancaDay, casablancaDateAt } from '@/lib/time';

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams);

    const expectedSecret = process.env.AD_NETWORK_WEBHOOK_SECRET;
    const headerSecret = req.headers.get('x-webhook-secret');

    let authed = false;
    if (expectedSecret && (raw.secret === expectedSecret || (headerSecret && safeEqual(headerSecret, expectedSecret)))) {
      authed = true;
    }
    if (!authed && expectedSecret && raw.sig) {
      const sigParams = new URLSearchParams();
      for (const [k, v] of url.searchParams) {
        if (k !== 'sig') {
          sigParams.set(k, v);
        }
      }
      const computed = crypto.createHmac('sha256', expectedSecret).update(sigParams.toString()).digest('hex');
      if (safeEqual(computed, raw.sig)) authed = true;
    }

    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nonce = raw.nonce;
    const legacyUserId = raw.userId;
    const legacyGameId = raw.gameId;

    const nonceKey = nonce ? `ad:nonce:${nonce}` : null;
    let placement = 'unlock';
    let userId = legacyUserId ?? null;
    let gameId = legacyGameId ?? '';

    if (nonceKey && userId === null) {
      const data = await redis.get(nonceKey);
      if (!data) {
        return NextResponse.json({ error: 'Unknown or expired nonce' }, { status: 404 });
      }
      const parsed = JSON.parse(data) as { userId: string; gameId: string; placement: string };
      userId = parsed.userId;
      gameId = parsed.gameId;
      placement = parsed.placement;
      await redis.del(nonceKey);
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    const cfg = await getConfig();
    const today = casablancaDay();
    const dailyStart = casablancaDateAt(today, 0, 0, 0);

    if (placement === 'reward') {
      const completedToday = await prisma.adImpression.count({
        where: { userId, placement: 'reward', status: 'COMPLETED', completedAt: { gte: dailyStart } },
      });
      if (completedToday >= (cfg.adDailyCap as unknown as number)) {
        return NextResponse.json({ error: 'Daily reward cap reached' }, { status: 429 });
      }

      const reward = cfg.adRewardCoins as unknown as number;
      await creditBalance({
        userId,
        amount: reward,
        reason: 'AD_REWARD',
        idempotencyKey: `ad:${nonce ?? crypto.randomUUID()}`,
        refType: 'AdImpression',
        refId: nonceKey ? `ad:nonce:${nonce}` : undefined,
      });
    } else {
      const token = await generateGameToken(userId, gameId);
      await redis.set(`ad_completed:${userId}:${gameId}`, token, 'EX', 120);
    }

    await prisma.adImpression.updateMany({
      where: nonceKey ? { nonce } : { userId, gameId, status: 'STARTED' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await bumpMission(userId, 'WATCH_N_ADS', 1);

    await prisma.event.create({
      data: { name: 'ad_completed', userId, props: { placement, gameId, nonce } },
    });

    return NextResponse.json({ status: 'success', message: 'Postback received' }, { status: 200 });
  } catch (error) {
    console.error('Postback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}