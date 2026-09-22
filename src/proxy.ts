import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith('/games/')) {
    /* RSC requests are Next.js-internal navigation/prefetch requests.
       They carry the header "rsc: 1" and never include a token.
       Let them through — the actual game content is in the iframe. */
    if (request.headers.get('rsc') === '1') {
      return NextResponse.next();
    }

    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/games/:path*',
};
