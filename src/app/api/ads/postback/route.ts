import { NextResponse } from 'next/server';
import { generateGameToken, redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    
    const secret = url.searchParams.get('secret') || req.headers.get('x-webhook-secret');
    const userId = url.searchParams.get('userId');
    const gameId = url.searchParams.get('gameId');

    const expectedSecret = process.env.AD_NETWORK_WEBHOOK_SECRET;
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId || !gameId) {
      return NextResponse.json({ error: 'Missing userId or gameId' }, { status: 400 });
    }

    const token = await generateGameToken(userId, gameId);

    // Save another key that the client can poll (using EX seconds in ioredis)
    await redis.set(`ad_completed:${userId}:${gameId}`, token, 'EX', 120);

    return NextResponse.json({ status: 'success', message: 'Postback received' }, { status: 200 });
  } catch (error: any) {
    console.error('Postback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
