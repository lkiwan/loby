import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { redis, generateGameToken } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { creditBalance } from '@/lib/ledger';
import { bumpMission } from '@/lib/missions';

const REWARD_COINS: Record<string, number> = {
  double_reward: 50,
  daily_bonus: 50,
  continue: 0,
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { nonce } = await req.json();
  if (!nonce) {
    return NextResponse.json({ error: 'Missing nonce' }, { status: 400 });
  }

  const raw = await redis.getdel(`ad:nonce:${nonce}`);
  if (!raw) {
    return NextResponse.json({ error: 'Invalid or used ad session' }, { status: 409 });
  }

  const data = JSON.parse(raw) as { userId: string; gameId: string; placement: string; issuedAt: number };
  if (data.userId !== session.user.id) {
    return NextResponse.json({ error: 'Ad session mismatch' }, { status: 403 });
  }

  const elapsed = Date.now() - data.issuedAt;
  if (elapsed < 5_000) {
    await prisma.adImpression.updateMany({
      where: { nonce, status: 'STARTED' },
      data: { status: 'REJECTED' },
    });
    return NextResponse.json({ error: 'Claimed too fast' }, { status: 400 });
  }
  if (elapsed > 300_000) {
    await prisma.adImpression.updateMany({
      where: { nonce, status: 'STARTED' },
      data: { status: 'EXPIRED' },
    });
    return NextResponse.json({ error: 'Ad session expired' }, { status: 410 });
  }

  await prisma.adImpression.updateMany({
    where: { nonce, status: 'STARTED' },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  await bumpMission(data.userId, 'WATCH_N_ADS', 1);

  if (data.placement === 'unlock') {
    const token = await generateGameToken(data.userId, data.gameId);
    return NextResponse.json({ redirectUrl: `/games/${data.gameId}?token=${token}` });
  }

  const amount = REWARD_COINS[data.placement] ?? 25;
  const entry = await creditBalance({
    userId: data.userId,
    amount,
    reason: 'AD_REWARD',
    idempotencyKey: `ad-reward:${nonce}`,
    refType: 'AdImpression',
    refId: nonce,
  });

  await prisma.event.create({
    data: {
      name: 'ad_completed',
      userId: data.userId,
      props: { placement: data.placement, gameId: data.gameId, nonce },
    },
  });

  return NextResponse.json({ newBalance: entry.balanceAfter, awarded: amount });
}