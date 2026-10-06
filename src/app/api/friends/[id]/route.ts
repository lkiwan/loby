import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await checkRate('friend-del', userId, 30, 300))) {
      return NextResponse.json({ error: 'بزاف د المحاولات. تسنى شوية.' }, { status: 429 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'المعرف ناقص.' }, { status: 400 });
    }

    /* scoped by userId so one account can never delete another's row */
    const deleted = await prisma.friend.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'الصاحبي ملقايش.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[friends] delete failed:', error);
    return NextResponse.json({ error: 'ما قدرناش نحيدو الصاحبي.' }, { status: 500 });
  }
}