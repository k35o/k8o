import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isAuthEnabled } from './shared/auth/auth-enabled';

const isDev = process.env.NODE_ENV === 'development';

// admin と同じ厳格ベース（外部スクリプト・外部 fetch・iframe を持たないため）。
// frame-ancestors 'none' は studio の公開/フォーク等の副作用ボタンを
// クリックジャッキングから守る要
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: blob: data:;
    font-src 'self';
    worker-src 'self' blob:;
    connect-src 'self';
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
`;

const contentSecurityPolicyHeaderValue = cspHeader
  .replaceAll(/\s{2,}/gu, ' ')
  .trim();

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  );
  return response;
}

export function proxy(request: NextRequest): NextResponse {
  if (!isAuthEnabled) {
    return withSecurityHeaders(NextResponse.next());
  }

  const { pathname } = request.nextUrl;

  // 公開共有ページは非ログインでも見られる（認証を通さない）。
  if (pathname === '/sign-in' || pathname.startsWith('/s/')) {
    return withSecurityHeaders(NextResponse.next());
  }

  const sessionCookie = getSessionCookie(request);
  if (sessionCookie === null) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL('/sign-in', request.url)),
    );
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
    },
  ],
};
