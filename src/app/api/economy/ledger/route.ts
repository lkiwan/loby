import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 100);
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const entries = await prisma.ledgerEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor } } : {}),
  });

  const hasMore = entries.length > limit;
  const page = hasMore ? entries.slice(0, limit) : entries;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return NextResponse.json({
    entries: page.map((e) => ({
      id: e.id,
      currency: e.currency,
      delta: e.delta,
      balanceAfter: e.balanceAfter,
      reason: e.reason,
      refType: e.refType,
      refId: e.refId,
      createdAt: e.createdAt,
    })),
    nextCursor,
    hasMore,
  });
}