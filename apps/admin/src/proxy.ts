import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

import { isAuthEnabled } from './shared/auth/auth-enabled';

export function proxy(request: NextRequest) {
  if (!isAuthEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/sign-in') {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (sessionCookie === null) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
    },
  ],
};
