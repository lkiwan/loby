import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';

const PASSWORD_MIN = 6;

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('change-password', session.user.id, 5, 300))) {
    return NextResponse.json({ error: 'بزاف د المحاولات. تسنى شوية.' }, { status: 429 });
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = (await req.json()) as { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  } catch {
    return NextResponse.json({ error: 'طلب ماشي هو هداك.' }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'عمر جميع الحقول.' }, { status: 400 });
  }
  if (newPassword.length < PASSWORD_MIN) {
    return NextResponse.json({ error: 'الباسورد الجديد خاص يكون فيه 6 حروف على الأقل.' }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'الباسورد الجديد ماشي كيف كيف فالتأكيد.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'الحساب مش موجود.' }, { status: 404 });
  }
  if (!user.password) {
    return NextResponse.json(
      { error: 'هاد الحساب تسجل بجوجل — الباسورد ماشي مربوط بيه.' },
      { status: 400 }
    );
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return NextResponse.json({ error: 'الباسورد الحالي غالط.' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}