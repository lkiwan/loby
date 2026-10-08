import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';
import { MAX_FRIENDS, sanitizeRoster } from '@/lib/roster';
import { GAMES } from '@/lib/games';

/* Called when a round ends. Bumps the "played with" counter for every saved
   friend who was at the table. Names that were never saved stay session-only
   and are only recorded as an event, so nothing leaks into the account list. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('friend-plays', userId, 60, 300))) {
    return NextResponse.json({ ok: true, counted: 0 });
  }

  let body: { gameId?: unknown; names?: unknown };
  try {
    body = (await req.json()) as { gameId?: unknown; names?: unknown };
  } catch {
    return NextResponse.json({ error: 'طلب ماشي هو هداك.' }, { status: 400 });
  }

  const gameId = typeof body.gameId === 'string' ? body.gameId : '';
  if (!GAMES.some((g) => g.id === gameId)) {
    return NextResponse.json({ error: 'هاد اللعبة مكايناش.' }, { status: 400 });
  }

  /* no game-specific caps here: the roster already passed through the game's
     rules on the way in, and a table can hold more names than one game allows */
  const names = sanitizeRoster(body.names);
  if (!names.length) {
    return NextResponse.json({ ok: true, counted: 0 });
  }

  const now = new Date();

  try {
    const { count } = await prisma.friend.updateMany({
      where: { userId, name: { in: names, mode: 'insensitive' } },
      data: { plays: { increment: 1 }, lastPlayedAt: now },
    });

    await prisma.event.create({
      data: {
        name: 'friend_played',
        userId,
        props: {
          gameId,
          names,
          count: Math.min(names.length, MAX_FRIENDS),
        },
      },
    });

    return NextResponse.json({ ok: true, counted: count });
  } catch (error) {
    /* honest failure: the frontend treats a non-ok response as a failed
       count, so never mask a real error behind { ok: true, counted: 0 } */
    console.error('[friends/plays] count failed:', error);
    return NextResponse.json({ error: 'ما قدرناش نسجلو اللعبات.' }, { status: 500 });
  }
}