import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const NAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, displayName: true, email: true, password: true, nameChangedAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const nameChangedAt = user.nameChangedAt?.getTime() ?? null;
  const nextNameChangeAt = nameChangedAt
    ? new Date(nameChangedAt + NAME_COOLDOWN_MS).toISOString()
    : null;
  const canChangeName = !nextNameChangeAt || Date.now() >= new Date(nextNameChangeAt).getTime();

  return NextResponse.json({
    username: user.username,
    displayName: user.displayName ?? user.username,
    email: user.email,
    hasPassword: Boolean(user.password),
    nameChangedAt,
    nextNameChangeAt,
    canChangeName,
  });
}