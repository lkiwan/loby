import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { levelFromXp } from '@/lib/ledger';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  /* 3-second server-side cache — avoids hitting the DB on rapid reloads
     (lobby page fetches balance on mount + after every checkin/game return). */
  try {
    const cached = await redis.get(`balance:${userId}`);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch {
    // Redis unavailable — fall through to DB
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      coins: true,
      tickets: true,
      xp: true,
      level: true,
      streakCount: true,
      longestStreak: true,
      referralCode: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const level = user.xp > 0 ? levelFromXp(user.xp) : user.level;
  const data = {
    coins: user.coins,
    tickets: user.tickets,
    xp: user.xp,
    level,
    streak: user.streakCount,
    longestStreak: user.longestStreak,
    referralCode: user.referralCode,
  };

  try {
    await redis.set(`balance:${userId}`, JSON.stringify(data), 'EX', 3);
  } catch {
    // ignore
  }

  return NextResponse.json(data);
}
