import { encodeRoster } from '@/lib/roster';

const MAX_FRIENDS = 15;
const MAX_NAME_LEN = 14;

function normalize(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.trim().replace(/\s+/g, ' ');
  if (!name || name.length > MAX_NAME_LEN) return null;
  return name;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const friends = await prisma.friend.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, createdAt: true },
  });

  return NextResponse.json({
    friends: friends.map((f) => ({ id: f.id, name: f.name })),
    count: friends.length,
    max: MAX_FRIENDS,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('friend-add', session.user.id, 20, 300))) {
    return NextResponse.json({ error: 'بزاف د المحاولات. تسنى شوية.' }, { status: 429 });
  }

  let body: { name?: string };
  try {
    body = (await req.json()) as { name?: string };
  } catch {
    return NextResponse.json({ error: 'طلب ماشي هو هداك.' }, { status: 400 });
  }

  const name = normalize(body.name);
  if (!name) {
    return NextResponse.json(
      { error: `السمية خاص تكون بين 1 و ${MAX_NAME_LEN} حرف.` },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  const existing = await prisma.friend.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  if (existing.some((f) => f.name === name)) {
    return NextResponse.json({ error: 'هاد الصاحبي موجود dejava.' }, { status: 409 });
  }
  if (existing.length >= MAX_FRIENDS) {
    return NextResponse.json(
      { error: `ما تقدرش تزيد أكثر من ${MAX_FRIENDS} صاحبي.` },
      { status: 409 }
    );
  }

  const friend = await prisma.friend.create({
    data: { userId, name },
    select: { id: true, name: true },
  });

  return NextResponse.json({ friend }, { status: 201 });
}
