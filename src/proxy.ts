import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Only protect /games/* routes
  if (pathname.startsWith('/games/')) {
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('403 Access Denied: No Token', { status: 403 });
    }

    try {
      const tokenKey = `game_token:${token}`;
      const data = await redis.get(tokenKey);

      if (!data) {
        return new NextResponse('403 Access Denied: Invalid or Expired Token', { status: 403 });
      }

      // Burn the token so it can't be reused
      await redis.del(tokenKey);

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware Redis Error:', error);
      return new NextResponse('500 Internal Server Error', { status: 500 });
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: '/games/:path*',
};
