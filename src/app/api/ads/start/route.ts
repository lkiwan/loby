import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { checkRate } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('ad_start', session.user.id, 20, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { gameId, placement = 'unlock', network = 'mock' } = await req.json();
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  const nonce = crypto.randomUUID();
  const key = `ad:nonce:${nonce}`;
  await redis.set(key, JSON.stringify({ userId: session.user.id, gameId, placement }), 'EX', 300);

  await prisma.adImpression.create({
    data: { userId: session.user.id, gameId, placement, network, nonce, status: 'STARTED' },
  });

  return NextResponse.json({ nonce, expiresIn: 300 });
}