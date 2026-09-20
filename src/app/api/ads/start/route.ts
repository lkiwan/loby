import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { getConfig } from '@/lib/config';
import { checkRate } from '@/lib/rateLimit';
import { casablancaDay } from '@/lib/time';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('ad_start', session.user.id, 20, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { gameId, placement = 'unlock' } = await req.json();
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  const userId = session.user.id;
  const cfg = await getConfig();
  const day = casablancaDay();
  const capKey = `ad:cap:${userId}:${day}`;

  try {
    const count = await redis.incr(capKey);
    if (count === 1) await redis.expire(capKey, 60 * 60 * 26);
    if (count > (cfg.adDailyCap as unknown as number)) {
      return NextResponse.json({ error: 'Daily ad limit reached' }, { status: 429 });
    }
  } catch {
    // cap is best-effort; fail open
  }

  const nonce = crypto.randomUUID();
  await redis.set(
    `ad:nonce:${nonce}`,
    JSON.stringify({ userId, gameId, placement, issuedAt: Date.now() }),
    'EX',
    300
  );

  await prisma.adImpression.create({
    data: { userId, gameId, placement, network: 'adsense_h5', nonce, status: 'STARTED' },
  });

  return NextResponse.json({ nonce, expiresIn: 300 });
}