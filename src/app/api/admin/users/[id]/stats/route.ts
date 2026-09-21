import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

type RawAgg = {
  sessions: number;
  seconds: bigint;
  firstStartedAt: Date | null;
  lastStartedAt: Date | null;
  lastEndedAt: Date | null;
};

type RawGameStat = {
  gameId: string;
  sessions: number;
  seconds: bigint;
  bestScore: number | null;
};

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/admin/users/[id]/stats'>) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [aggRows, gameRows, games, deviceCount, recentSessions, providerAccounts] = await Promise.all([
    prisma.$queryRaw<RawAgg[]>`
      SELECT COUNT(*)::int AS sessions,
             COALESCE(SUM(EXTRACT(EPOCH FROM ("endedAt" - "startedAt"))), 0)::bigint AS seconds,
             MIN("startedAt") AS "firstStartedAt",
             MAX("startedAt") AS "lastStartedAt",
             MAX("endedAt") AS "lastEndedAt"
      FROM "PlaySession"
      WHERE "userId" = ${id}
    `,
    prisma.$queryRaw<RawGameStat[]>`
      SELECT "gameId",
             COUNT(*)::int AS sessions,
             COALESCE(SUM(EXTRACT(EPOCH FROM ("endedAt" - "startedAt"))), 0)::bigint AS seconds,
             MAX("score") AS "bestScore"
      FROM "PlaySession"
      WHERE "userId" = ${id}
      GROUP BY "gameId"
      ORDER BY seconds DESC
    `,
    prisma.game.findMany({ select: { id: true, slug: true, titleAr: true, titleFr: true } }),
    prisma.device.count({ where: { userId: id } }),
    prisma.playSession.findMany({
      where: { userId: id },
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: { id: true, gameId: true, score: true, coinsSpent: true, unlockMethod: true, startedAt: true, endedAt: true },
    }),
    prisma.account.findMany({ where: { userId: id } }),
  ]);

  const agg = aggRows[0];
  const gameTitles = new Map(games.map((g) => [g.id, g.titleFr ?? g.slug]));

  return NextResponse.json({
    user,
    carrier: {
      firstStartedAt: agg.firstStartedAt ?? null,
      lastStartedAt: agg.lastStartedAt ?? null,
      lastEndedAt: agg.lastEndedAt ?? null,
      deviceCount,
    },
    aggregate: {
      sessions: agg.sessions,
      seconds: Number(agg.seconds),
    },
    games: gameRows.map((g) => ({
      gameId: g.gameId,
      title: gameTitles.get(g.gameId) ?? g.gameId,
      sessions: g.sessions,
      seconds: Number(g.seconds),
      bestScore: g.bestScore,
    })),
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      gameId: s.gameId,
      title: gameTitles.get(s.gameId) ?? s.gameId,
      score: s.score,
      coinsSpent: s.coinsSpent,
      unlockMethod: s.unlockMethod,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
    })),
    providers: providerAccounts.map((a) => a.provider),
  });
}