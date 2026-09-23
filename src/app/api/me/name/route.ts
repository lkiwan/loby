import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';

const NAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('rename', session.user.id, 5, 300))) {
    return NextResponse.json({ error: 'بزاف د المحاولات. تسنى شوية.' }, { status: 429 });
  }

  let body: { displayName?: string };
  try {
    body = (await req.json()) as { displayName?: string };
  } catch {
    return NextResponse.json({ error: 'طلب ماشي هو هداك.' }, { status: 400 });
  }

  const displayName = body.displayName?.trim().replace(/\s+/g, ' ');
  if (!displayName || displayName.length < 2 || displayName.length > 30) {
    return NextResponse.json(
      { error: 'السمية خاص تكون بين 2 و 30 حرف.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nameChangedAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'الحساب مش موجود.' }, { status: 404 });
  }

  const last = user.nameChangedAt?.getTime() ?? 0;
  const nextAt = last + NAME_COOLDOWN_MS;
  if (last && Date.now() < nextAt) {
    return NextResponse.json(
      {
        error: `قدرتي تبدل السمية من بعد ${new Date(nextAt).toLocaleDateString('ar-MA')}.`,
        nextNameChangeAt: new Date(nextAt).toISOString(),
      },
      { status: 429 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName, nameChangedAt: new Date() },
  });

  const nextNow = new Date(Date.now() + NAME_COOLDOWN_MS).toISOString();
  return NextResponse.json({ displayName, nextNameChangeAt: nextNow });
}