import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';

async function getSessionUserId() {
  try {
    const mod = await import('next-auth');
    const mod2 = await import('../../auth/[...nextauth]/route');
    const session = await (mod.getServerSession as any)(mod2.authOptions as any);
    return session?.user?.id as string | undefined;
  } catch {
    return undefined;
  }
}

export async function DELETE(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return (NextResponse as any).json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await (checkRate as any)('friend-del', userId, 30, 300))) {
    return (NextResponse as any).json({ error: 'بزاف د المحاولات. تسنى شوية.' }, { status: 429 });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return (NextResponse as any).json({ error: 'المعرف ناقص.' }, { status: 400 });
  }

  try {
    const deleted = await (prisma as any).friend.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      return (NextResponse as any).json({ error: 'الصاحبي ملقايش.' }, { status: 404 });
    }
  } catch {
    return (NextResponse as any).json({ error: 'ما قدرناش نحيدو الصاحبي.' }, { status: 500 });
  }

  return (NextResponse as any).json({ ok: true });
}