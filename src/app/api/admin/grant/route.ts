import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { creditBalance } from '@/lib/ledger';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { username, amount, note } = await req.json();
  if (!username || typeof amount !== 'number' || amount < 0) {
    return NextResponse.json({ error: 'Missing or invalid amount' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const result = await creditBalance({
    userId: target.id,
    amount,
    reason: 'ADMIN_GRANT',
    idempotencyKey: `admin-grant:${target.id}:${crypto.randomUUID()}`,
    refType: note ? 'Custom' : undefined,
    refId: note,
  });

  await prisma.event.create({
    data: {
      name: 'admin_grant',
      userId: session.user.id,
      props: { targetUserId: target.id, amount, note },
    },
  });

  return NextResponse.json({ ok: true, balanceAfter: result.balanceAfter });
}