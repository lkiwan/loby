import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { checkRate } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('ad_start', session.user.id, 200, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { gameId, placement = 'unlock' } = await req.json();
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  const userId = session.user.id;
  const nonce = crypto.randomUUID();

  await redis.set(
    `ad:nonce:${nonce}`,
    JSON.stringify({ userId, gameId, placement, issuedAt: Date.now() }),
    'EX',
    300
  );

  await prisma.adImpression.create({
    data: { userId, gameId, placement, network: 'adsterra', nonce, status: 'STARTED' },
  });

  return NextResponse.json({ nonce, expiresIn: 300 });
}
