import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decodeSessionToken, verifySessionToken } from '@/lib/session';

export async function POST(req: Request) {
  const { jwt } = await req.json();
  if (!jwt) {
    return NextResponse.json({ error: 'Missing jwt' }, { status: 400 });
  }

  const payload = decodeSessionToken(jwt);
  if (!payload.gameId || !payload.sessionId) {
    return NextResponse.json({ error: 'Malformed token' }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { id: payload.gameId } });
  if (!game || !game.isActive) {
    return NextResponse.json({ error: 'Game inactive or missing' }, { status: 403 });
  }

  const result = verifySessionToken(jwt, game.hmacSecret);
  if (!result.valid || !result.sessionId) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const playSession = await prisma.playSession.findFirst({
    where: { id: result.sessionId, endedAt: null },
    select: { id: true, userId: true, gameId: true, startedAt: true },
  });

  if (!playSession || playSession.gameId !== result.gameId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, sessionId: playSession.id, userId: playSession.userId, gameId: playSession.gameId });
}