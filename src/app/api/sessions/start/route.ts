import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { spendBalance, InsufficientCoinsError } from '@/lib/ledger';
import { checkRate } from '@/lib/rateLimit';
import { createPlaySession, signSessionToken } from '@/lib/session';
import { bumpGamesPlayed } from '@/lib/missions';
import { generateGameToken } from '@/lib/redis';
import { casablancaDateAt, casablancaDay } from '@/lib/time';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('session_start', session.user.id, 10, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { gameId, unlockMethod = 'COINS' } = await req.json();
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const userId = session.user.id;

  if (unlockMethod === 'FREE_DAILY') {
    const todayStart = casablancaDateAt(casablancaDay(), 0, 0, 0);
    const used = await prisma.playSession.count({
      where: { userId, unlockMethod: 'FREE_DAILY', startedAt: { gte: todayStart } },
    });
    if (used > 0) {
      return NextResponse.json({ error: 'Free play already used today' }, { status: 409 });
    }
  } else if (unlockMethod !== 'FREE_DAILY') {
    try {
      await spendBalance({
        userId,
        amount: game.playCost,
        reason: 'PLAY_COST',
        idempotencyKey: `play:${userId}:${gameId}:${crypto.randomUUID()}`,
        refType: 'Game',
        refId: gameId,
      });
    } catch (err) {
      if (err instanceof InsufficientCoinsError) {
        return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
      }
      throw err;
    }
  }

  const sessionId = await createPlaySession(userId, game, unlockMethod === 'FREE_DAILY' ? 'FREE_DAILY' : 'COINS');
  const exp = Math.floor(Date.now() / 1000) + 90;
  const jwt = signSessionToken(sessionId, userId, game.id, exp, game.hmacSecret);
  const gameToken = await generateGameToken(userId, gameId);
  void bumpGamesPlayed(userId, gameId);

  return NextResponse.json(
    { token: gameToken, sessionId, jwt, expiresAt: exp, gameId: game.id },
    { status: 200 }
  );
}