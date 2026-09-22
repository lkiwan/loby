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
import { GAMES as LOCAL_GAMES } from '@/lib/games';
import type { Game } from '@prisma/client';

const makeKey = (userId: string, gameId: string, tag: string, nonce?: string) =>
  `play:${userId}:${gameId}:${tag}:${nonce ?? 'gen'}`;

/* Retry a Prisma call up to 3 times with exponential back-off.
   Handles cold-start TCP connection races where the first 1-2 queries fail. */
async function prismaRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [600, 1200]; // wait 600ms, then 1200ms before giving up
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < delays.length) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw lastErr;
}

/* Auto-seed a game from local config when it's missing from the DB. */
async function resolveGame(gameId: string): Promise<Game | null> {
  const fromDb = await prismaRetry(() =>
    prisma.game.findUnique({ where: { id: gameId } })
  );
  if (fromDb) return fromDb;

  const local = LOCAL_GAMES.find((g) => g.id === gameId);
  if (!local) return null;

  const hmacSecret = crypto.randomBytes(32).toString('hex');
  return prismaRetry(() =>
    prisma.game.upsert({
      where: { id: gameId },
      update: {},
      create: {
        id: local.id,
        slug: local.id,
        titleAr: local.darijaTitle,
        titleFr: local.latinTitle,
        embedUrl: '',
        hmacSecret,
        playCost: local.cost,
        continueCost: Math.ceil(local.cost * 1.5),
        sortOrder: LOCAL_GAMES.indexOf(local),
      },
    })
  );
}

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
      resolveGame(gameId),
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
        /* Use prismaRetry so the same idempotency key is reused on retry,
           preventing any chance of double-charging. */
        entry = await prismaRetry(() =>
          spendBalance({
            userId,
            amount: game.playCost,
            reason: 'PLAY_COST',
            idempotencyKey: key,
            refType: 'Game',
            refId: gameId,
          })
        );
      } catch (err) {
        if (err instanceof InsufficientCoinsError) {
          return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
        }
        throw err;
      }

      // Parallel: play session + token generation
      const [, gameToken] = await Promise.all([
        prismaRetry(() => createPlaySession(userId, game, 'COINS', game.playCost)),
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
        prismaRetry(() => createPlaySession(userId, game, 'FREE_DAILY')),
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
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[unlock] 500 →', msg);
    return NextResponse.json(
      { error: 'Internal Server Error', detail: msg },
      { status: 500 }
    );
  }
}
