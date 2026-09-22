import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateGameToken, redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { spendBalance, InsufficientCoinsError } from '@/lib/ledger';
import { checkRate } from '@/lib/rateLimit';
import { createPlaySession } from '@/lib/session';
import { bumpMission } from '@/lib/missions';
import { casablancaDay, casablancaDateAt } from '@/lib/time';

const makeKey = (userId: string, gameId: string, tag: string, nonce?: string) =>
  `play:${userId}:${gameId}:${tag}:${nonce ?? 'gen'}`;

export async function POST(req: Request) {
  try {
    const { gameId, paymentMethod, nonce } = await req.json();
    const idempotencyHeader = req.headers.get('Idempotency-Key');

    if (!gameId || !paymentMethod) {
      return NextResponse.json({ error: 'Missing gameId or paymentMethod' }, { status: 400 });
    }

    // Parallel: session lookup + game lookup (saves ~50ms)
    const [session, game] = await Promise.all([
      getServerSession(authOptions),
      prisma.game.findUnique({ where: { id: gameId } }),
    ]);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (!(await checkRate('unlock', session.user.id, 10, 60))) {
      return NextResponse.json({ error: 'Too many attempts, slow down' }, { status: 429 });
    }

    const gameUrl = `/games/${gameId}`;
    const userId = session.user.id;

    if (paymentMethod === 'coins') {
      const key = makeKey(userId, gameId, 'coins', idempotencyHeader ?? crypto.randomUUID());
      let entry;
      try {
        entry = await spendBalance({
          userId,
          amount: game.playCost,
          reason: 'PLAY_COST',
          idempotencyKey: key,
          refType: 'Game',
          refId: gameId,
        });
      } catch (err) {
        if (err instanceof InsufficientCoinsError) {
          return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
        }
        throw err;
      }

      // Parallel: play session + token generation (saves ~50ms)
      const [, gameToken] = await Promise.all([
        createPlaySession(userId, game, 'COINS', game.playCost),
        generateGameToken(userId, gameId),
      ]);

      // Use balanceAfter from ledger entry instead of an extra DB round-trip
      const remainingCoins = (entry as { balanceAfter?: number })?.balanceAfter ?? 0;

      return NextResponse.json(
        { redirectUrl: `${gameUrl}?token=${gameToken}`, remainingCoins },
        { status: 200 }
      );
    }

    if (paymentMethod === 'free') {
      const todayStart = casablancaDateAt(casablancaDay(), 0, 0, 0);
      const usedToday = await prisma.playSession.count({
        where: { userId, unlockMethod: 'FREE_DAILY', startedAt: { gte: todayStart } },
      });
      if (usedToday > 0) {
        return NextResponse.json({ error: 'Free play already used today' }, { status: 400 });
      }

      const [, gameToken] = await Promise.all([
        createPlaySession(userId, game, 'FREE_DAILY'),
        generateGameToken(userId, gameId),
      ]);
      return NextResponse.json({ redirectUrl: `${gameUrl}?token=${gameToken}` }, { status: 200 });
    }

    if (paymentMethod === 'ad') {
      if (typeof nonce === 'string') {
        const adKey = `ad:nonce:${nonce}`;
        const data = await redis.get(adKey);
        if (!data) {
          return NextResponse.json({ error: 'Expired or invalid ad session' }, { status: 400 });
        }
        const parsed = JSON.parse(data) as { userId: string; gameId: string; placement: string };
        if (parsed.userId !== userId || parsed.gameId !== gameId) {
          return NextResponse.json({ error: 'Ad session mismatch' }, { status: 400 });
        }

        // Parallel: delete key + update impression + bump mission + create session + token
        const [, , , , gameToken] = await Promise.all([
          redis.del(adKey),
          prisma.adImpression.updateMany({
            where: { nonce, status: 'STARTED' },
            data: { status: 'COMPLETED', completedAt: new Date() },
          }),
          bumpMission(userId, 'WATCH_N_ADS', 1),
          createPlaySession(userId, game, 'AD'),
          generateGameToken(userId, gameId),
        ]);

        return NextResponse.json(
          { redirectUrl: `${gameUrl}?token=${gameToken}` },
          { status: 200 }
        );
      }

      const adKey = `ad_completed:${userId}:${gameId}`;
      const completedToken = await redis.get(adKey);

      if (completedToken) {
        await redis.del(adKey);
        await createPlaySession(userId, game, 'AD');
        return NextResponse.json({ redirectUrl: `${gameUrl}?token=${completedToken}` }, { status: 200 });
      }

      return NextResponse.json({ status: 'pending', message: 'Waiting for ad completion postback' }, { status: 202 });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  } catch (error) {
    console.error('Unlock error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
