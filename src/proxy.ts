import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Only protect /games/* routes
  if (pathname.startsWith('/games/')) {
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('403 Access Denied: Ad Verification Required (No Token)', { status: 403 });
    }

    try {
      // Fetch our internal API route which can use standard Node.js ioredis TCP connections
      const apiUrl = new URL(`/api/games/verify-token?token=${token}`, request.url);
      const res = await fetch(apiUrl.toString());
      const getResult = await res.json();

      if (!res.ok || !getResult.valid) {
        return new NextResponse('403 Access Denied: Invalid or Expired Token', { status: 403 });
      }

      // Token is valid and was burned by the API route. Let the request proceed.
      return NextResponse.next();

    } catch (error) {
      console.error('Middleware Verification Error:', error);
      return new NextResponse('500 Internal Server Error', { status: 500 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/games/:path*',
};
