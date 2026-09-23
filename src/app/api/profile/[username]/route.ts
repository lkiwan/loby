import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { gamesLevelForPlays } from '@/lib/ledger';

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
  const gamesPlayed = user._count.sessions;
  /* Level is game-driven: every 10 games -> +1 level. Progress = games into the current step. */
  const level = gamesLevelForPlays(gamesPlayed);
  const levelProgress = Math.round(((gamesPlayed % 10) / 10) * 100);

  return NextResponse.json({
    username: user.username,
    image: user.image,
    coins: user.coins,
    xp: user.xp,
    level,
    levelProgress,
    streakCount: user.streakCount,
    longestStreak: user.longestStreak,
    referralCode: isOwn ? user.referralCode : null,
    createdAt: user.createdAt,
    gamesPlayed,
    recentSessions: user.sessions,
  });
}
