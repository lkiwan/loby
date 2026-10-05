import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('friend-del', session.user.id, 30, 300))) {
    return NextResponse.json({ error: 'بزاف د المحاولات. تسنى شوية.' }, { status: 429 });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'المعرف ناقص.' }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    const deleted = await prisma.friend.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'الصاحبي ملقايش.' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'ما قدرناش نحيدو الصاحبي.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}