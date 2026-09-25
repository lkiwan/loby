import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get('tab') ?? 'coins';

  const field = tab === 'xp' ? 'xp' : tab === 'streak' ? 'streakCount' : 'coins';
  const limit = 5;
  const cacheKey = `leaderboard:${field}:top5`;

  /* 30-second Redis cache — leaderboard doesn't need real-time accuracy */
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
      });
    }
  } catch {
    // fall through to DB
  }

  const players = await prisma.user.findMany({
    where: { status: 'ACTIVE', username: { not: null } },
    select: {
      id: true,
      username: true,
      coins: true,
      xp: true,
      level: true,
      streakCount: true,
    },
    orderBy: { [field]: 'desc' },
    take: limit,
  });

  const data = { players: players.map((p, i) => ({ ...p, rank: i + 1 })) };

  try {
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 30);
  } catch {
    // ignore
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  });
}
