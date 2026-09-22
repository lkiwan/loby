import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { xpForLevel } from '@/lib/ledger';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      image: true,
      coins: true,
      xp: true,
      level: true,
      streakCount: true,
      longestStreak: true,
      referralCode: true,
      createdAt: true,
      sessions: {
        select: { gameId: true, startedAt: true, score: true, xpAwarded: true },
        orderBy: { startedAt: 'desc' },
        take: 10,
      },
      _count: { select: { sessions: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isOwn = session?.user?.id === user.id;
  const lvl = user.level;
  const xpCurrent = xpForLevel(lvl);
  const xpNext = xpForLevel(lvl + 1);
  const xpProgress =
    xpNext > xpCurrent
      ? Math.round(((user.xp - xpCurrent) / (xpNext - xpCurrent)) * 100)
      : 100;

  return NextResponse.json({
    username: user.username,
    image: user.image,
    coins: user.coins,
    xp: user.xp,
    level: user.level,
    xpProgress: Math.max(0, Math.min(100, xpProgress)),
    xpForNext: xpNext,
    streakCount: user.streakCount,
    longestStreak: user.longestStreak,
    referralCode: isOwn ? user.referralCode : null,
    createdAt: user.createdAt,
    gamesPlayed: user._count.sessions,
    recentSessions: user.sessions,
  });
}
