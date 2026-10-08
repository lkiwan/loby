import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { checkRate } from '@/lib/rateLimit';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { gameId, placement = 'unlock' } = await req.json();

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  const isGuest = !session?.user?.id;
  const ip = getClientIp(req);
  const rateLimitId = isGuest ? `guest:${ip}` : session!.user.id;

  // Guests get a lower rate limit per IP
  if (!(await checkRate('ad_start', rateLimitId, isGuest ? 20 : 200, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const nonce = crypto.randomUUID();
  // For guests, use a random ephemeral ID (not stored in DB)
  const userId = isGuest ? `guest:${crypto.randomUUID()}` : session!.user.id;

  await redis.set(
    `ad:nonce:${nonce}`,
    JSON.stringify({ userId, gameId, placement, issuedAt: Date.now(), isGuest }),
    'EX',
    300
  );

  // Only create DB impression record for authenticated users (userId FK required)
  if (!isGuest) {
    await prisma.adImpression.create({
      data: { userId: session!.user.id, gameId, placement, network: 'adsterra', nonce, status: 'STARTED' },
    });
  }

  return NextResponse.json({ nonce, expiresIn: 300 });
}
