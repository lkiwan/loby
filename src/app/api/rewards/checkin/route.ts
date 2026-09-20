import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { creditBalance } from '@/lib/ledger';
import { getConfig } from '@/lib/config';
import { checkRate } from '@/lib/rateLimit';
import { casablancaDay, casablancaDateAt, yesterdayCasablanca, shiftCasablanca } from '@/lib/time';

function dayDiffDays(fromDay: string, toDay: string): number {
  const [y1, m1, d1] = fromDay.split('-').map(Number);
  const [y2, m2, d2] = toDay.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('checkin', session.user.id, 5, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const cfg = await getConfig();
  const today = casablancaDay();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.lastCheckinOn && casablancaDay(user.lastCheckinOn) === today) {
    return NextResponse.json({ claimed: false, already: true, streak: user.streakCount });
  }

  const yesterday = yesterdayCasablanca(today);
  const lastDay = user.lastCheckinOn ? casablancaDay(user.lastCheckinOn) : null;

  let streak: number;
  let usedFreeze = false;

  if (lastDay === yesterday) {
    streak = user.streakCount + 1;
  } else if (lastDay && user.freezesLeft > 0 && dayDiffDays(lastDay, yesterday) <= 3) {
    streak = user.streakCount + 1;
    usedFreeze = true;
  } else {
    streak = 1;
  }

  const ladder = (cfg.checkinLadder as unknown as number[]) ?? [25, 35, 50, 75, 100, 150, 250];
  const reward = ladder[(streak - 1) % Math.max(1, ladder.length)] ?? ladder[0];
  const longest = Math.max(user.longestStreak, streak);

  await creditBalance({
    userId: user.id,
    amount: reward,
    reason: 'DAILY_CHECKIN',
    idempotencyKey: `checkin:${user.id}:${today}`,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      streakCount: streak,
      longestStreak: longest,
      lastCheckinOn: casablancaDateAt(today, 12, 0, 0),
      freezesLeft: usedFreeze ? user.freezesLeft - 1 : user.freezesLeft,
    },
  });

  try {
    const { redis } = await import('@/lib/redis');
    const midnight = casablancaDateAt(shiftCasablanca(today, 1), 0, 0, 0);
    await redis.set(`streak:${user.id}`, JSON.stringify({ streak, freezesLeft: usedFreeze ? user.freezesLeft - 1 : user.freezesLeft }), 'EX', Math.max(60, Math.floor((midnight.getTime() - Date.now()) / 1000)));
  } catch {
    // cache is optional
  }

  await prisma.event.create({
    data: { name: 'checkin', userId: user.id, props: { streak, reward, usedFreeze } },
  });

  return NextResponse.json({ claimed: true, streak, reward, longest, usedFreeze });
}