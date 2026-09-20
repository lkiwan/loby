import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { addXp } from '@/lib/ledger';
import { signScore } from '@/lib/session';
import { bumpMission } from '@/lib/missions';
import { getConfig } from '@/lib/config';

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

  const playSession = await prisma.playSession.findFirst({
    where: { id: sessionId, gameId, endedAt: null },
    include: { game: true },
  });

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

  const cfg = await getConfig();
  const xpBase = cfg.xpBase as unknown as number;
  const xpCap = cfg.xpCap as unknown as number;
  const xp = Math.min(xpCap, xpBase + Math.floor(score / Math.max(1, playSession.game.xpDivisor)));

  await prisma.playSession.update({
    where: { id: playSession.id },
    data: { score, scoreVerified: true, endedAt: new Date() },
  });

  if (xp > 0) {
    await addXp(playSession.userId, xp, playSession.id);
  }

  await bumpMission(playSession.userId, 'PLAY_N_GAMES', 1, gameId);
  await bumpMission(playSession.userId, 'PLAY_SPECIFIC_GAME', 1, gameId);

  await prisma.event.create({
    data: {
      name: 'play_complete',
      userId: playSession.userId,
      props: { gameId, score, xp, sessionId },
    },
  });

  const user = await prisma.user.findUnique({ where: { id: playSession.userId } });

  return NextResponse.json({ ok: true, xp, coins: user?.coins ?? 0 });
}