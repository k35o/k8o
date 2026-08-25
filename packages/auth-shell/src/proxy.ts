import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isAuthEnabled } from './auth-enabled';

const isDev = process.env['NODE_ENV'] === 'development';

// admin / ai はどちらも認証済みの面で外部埋め込みを持たないため、main より厳格に
// できる（GA / codepen / vercel-scripts の許可は不要）。DB 書き込み・push 送信・
// 課金の伴う操作を担う面なので XSS・クリックジャッキングの被害範囲を CSP で絞る。
// frame-ancestors 'none' は ai studio の公開/フォーク等の副作用ボタンを守る要
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

// publicPathPrefixes は認証を通さず公開するパスの前方一致。/sign-in はリダイレクト
// 先そのものなので常に公開する
export const createProxy = (
  publicPathPrefixes: readonly string[] = [],
): ((request: NextRequest) => NextResponse) => {
  const isPublicPath = (pathname: string): boolean =>
    pathname === '/sign-in' ||
    publicPathPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (request: NextRequest): NextResponse => {
    if (!isAuthEnabled) {
      return withSecurityHeaders(NextResponse.next());
    }

    if (isPublicPath(request.nextUrl.pathname)) {
      return withSecurityHeaders(NextResponse.next());
    }

    const sessionCookie = getSessionCookie(request);
    if (sessionCookie === null) {
      return withSecurityHeaders(
        NextResponse.redirect(new URL('/sign-in', request.url)),
      );
    }

    return withSecurityHeaders(NextResponse.next());
  };
};
