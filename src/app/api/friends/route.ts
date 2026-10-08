import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';
import { MAX_FRIENDS, MAX_NAME_LEN, nameKey, normalizeName } from '@/lib/roster';

const FRIEND_SELECT = {
  id: true,
  name: true,
  plays: true,
  lastPlayedAt: true,
  createdAt: true,
} as const;

function shape(f: { id: string; name: string; plays: number; lastPlayedAt: Date | null }) {
  return {
    id: f.id,
    name: f.name,
    plays: f.plays,
    lastPlayedAt: f.lastPlayedAt ? f.lastPlayedAt.toISOString() : null,
  };
}

async function listFriends(userId: string) {
  const rows = await prisma.friend.findMany({
    where: { userId },
    orderBy: [{ plays: 'desc' }, { createdAt: 'asc' }],
    select: FRIEND_SELECT,
  });
  return rows;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await listFriends(userId);
    return NextResponse.json({
      friends: rows.map(shape),
      count: rows.length,
      max: MAX_FRIENDS,
    });
  } catch (error) {
    console.error('[friends] list failed:', error);
    return NextResponse.json({ error: 'ما قدرناش نجيبو الصحاب.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await checkRate('friend-add', userId, 30, 300))) {
      return NextResponse.json({ error: 'بزاف د المحاولات. تسنى شوية.' }, { status: 429 });
    }

    let body: { name?: unknown; names?: unknown };
    try {
      body = (await req.json()) as { name?: unknown; names?: unknown };
    } catch {
      return NextResponse.json({ error: 'طلب ماشي هو هداك.' }, { status: 400 });
    }

    const raw = Array.isArray(body.names) ? body.names : [body.name];
    const wanted: string[] = [];
    for (const item of raw) {
      const n = normalizeName(item);
      if (n && !wanted.some((w) => nameKey(w) === nameKey(n))) wanted.push(n);
    }

    if (!wanted.length) {
      return NextResponse.json(
        { error: `السمية خاص تكون بين 1 و ${MAX_NAME_LEN} حرف.` },
        { status: 400 },
      );
    }

    const existing = await listFriends(userId);
    const taken = new Set(existing.map((f) => nameKey(f.name)));
    const added: typeof existing = [];
    const skipped: string[] = [];

    for (const name of wanted) {
      const key = nameKey(name);
      if (taken.has(key)) {
        skipped.push(name);
        continue;
      }
      if (existing.length + added.length >= MAX_FRIENDS) {
        skipped.push(name);
        continue;
      }
      try {
        added.push(
          await prisma.friend.create({ data: { userId, name }, select: FRIEND_SELECT }),
        );
        taken.add(key);
      } catch (e) {
        /* unique constraint race — treat as already saved; anything
           else is a real failure and bubbles up to the handler */
        if ((e as { code?: string })?.code !== 'P2002') throw e;
        skipped.push(name);
      }
    }

    const rows = await listFriends(userId);

    if (!added.length) {
      return NextResponse.json(
        {
          error:
            existing.length >= MAX_FRIENDS
              ? `ما تقدرش تزيد أكثر من ${MAX_FRIENDS} صاحبي.`
              : 'هاد الصاحبي موجود dejava.',
          friends: rows.map(shape),
          count: rows.length,
          max: MAX_FRIENDS,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        friend: shape(added[added.length - 1]),
        saved: added.map((a) => a.name),
        skipped,
        friends: rows.map(shape),
        count: rows.length,
        max: MAX_FRIENDS,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[friends] add failed:', error);
    return NextResponse.json({ error: 'ما قدرناش نسجلو الصاحب.' }, { status: 500 });
  }
}