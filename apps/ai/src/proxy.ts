import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

import { isAuthEnabled } from './shared/auth/auth-enabled';

export function proxy(request: NextRequest) {
  if (!isAuthEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 公開共有ページと、そのビルド済みアセット配信は非ログインでも見られる（認証を通さない）。
  if (
    pathname === '/sign-in' ||
    pathname.startsWith('/s/') ||
    pathname.startsWith('/s-assets/')
  ) {
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
