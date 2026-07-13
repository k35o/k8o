import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

import { isAuthEnabled } from './shared/auth/auth-enabled';

const isDev = process.env.NODE_ENV === 'development';

// admin は認証済みの管理面で外部埋め込みを持たないため、main より厳格にできる
// （GA / codepen / vercel-scripts の許可は不要）。DB 書き込みや push 送信を
// 担う面なので XSS・クリックジャッキングの被害範囲を CSP で絞る
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

export function proxy(request: NextRequest) {
  if (!isAuthEnabled) {
    return withSecurityHeaders(NextResponse.next());
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/sign-in') {
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
