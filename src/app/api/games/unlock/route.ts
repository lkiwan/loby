import { NextResponse } from 'next/server';
import { generateGameToken, redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, paymentMethod } = await req.json();

    if (!gameId || !paymentMethod) {
      return NextResponse.json({ error: 'Missing gameId or paymentMethod' }, { status: 400 });
    }

    const gameUrl = `/games/${gameId}`;

    if (paymentMethod === 'coins') {
      const COST = 10;
      
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      if (user.coins < COST) {
        return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
      }

      // Deduct coins
      await prisma.user.update({
        where: { id: user.id },
        data: { coins: user.coins - COST },
      });

      const gameToken = await generateGameToken(user.id, gameId);
      
      return NextResponse.json({ redirectUrl: `${gameUrl}?token=${gameToken}`, remainingCoins: user.coins - COST }, { status: 200 });

    } else if (paymentMethod === 'ad') {
      const adKey = `ad_completed:${session.user.id}:${gameId}`;
      const completedToken = await redis.get(adKey);
      
      if (completedToken) {
        await redis.del(adKey);
        return NextResponse.json({ redirectUrl: `${gameUrl}?token=${completedToken}` }, { status: 200 });
      } else {
        return NextResponse.json({ status: 'pending', message: 'Waiting for ad completion postback' }, { status: 202 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Unlock error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
