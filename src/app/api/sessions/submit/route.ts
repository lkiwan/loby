import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { addXp } from '@/lib/ledger';
import { signScore } from '@/lib/session';
import { bumpMission } from '@/lib/missions';
import { getConfig } from '@/lib/config';
import { redis } from '@/lib/redis';

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  const { sessionId, gameId, score, nonce, sig } = await req.json();

  if (!sessionId || !gameId || typeof score !== 'number' || !nonce || !sig) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  /* Parallel: session lookup + config (saves ~50ms) */
  const [playSession, cfg] = await Promise.all([
    prisma.playSession.findFirst({
      where: { id: sessionId, gameId, endedAt: null },
      include: { game: { select: { hmacSecret: true, maxPlausibleScore: true, xpDivisor: true } } },
    }),
    getConfig(),
  ]);

  if (!playSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const expectedSig = signScore(sessionId, score, nonce, playSession.game.hmacSecret);
  if (!safeEqual(expectedSig, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (score < 0 || score > playSession.game.maxPlausibleScore) {
    return NextResponse.json({ error: 'Score rejected as implausible' }, { status: 400 });
  }

  const xpBase = cfg.xpBase as unknown as number;
  const xpCap = cfg.xpCap as unknown as number;
  const xp = Math.min(xpCap, xpBase + Math.floor(score / Math.max(1, playSession.game.xpDivisor)));

  /* Parallel: end session + award XP (both are independent writes) */
  const [, xpResult] = await Promise.all([
    prisma.playSession.update({
      where: { id: playSession.id },
      data: { score, scoreVerified: true, endedAt: new Date() },
    }),
    xp > 0 ? addXp(playSession.userId, xp, playSession.id) : Promise.resolve(null),
  ]);

  /* Fire-and-forget: missions + event + cache invalidation (non-blocking) */
  Promise.all([
    bumpMission(playSession.userId, 'PLAY_N_GAMES', 1, gameId).catch(() => {}),
    bumpMission(playSession.userId, 'PLAY_SPECIFIC_GAME', 1, gameId).catch(() => {}),
    prisma.event.create({
      data: { name: 'play_complete', userId: playSession.userId, props: { gameId, score, xp, sessionId } },
    }).catch(() => {}),
    /* Invalidate balance cache so next fetch reflects new XP/coins */
    redis.del(`balance:${playSession.userId}`).catch(() => {}),
  ]);

  /* Return coins from the XP transaction result to avoid an extra DB round-trip */
  const coins = (xpResult as { coins?: number } | null)?.coins
    ?? (await prisma.user.findUnique({ where: { id: playSession.userId }, select: { coins: true } }))?.coins
    ?? 0;

  return NextResponse.json({ ok: true, xp, coins });
}
