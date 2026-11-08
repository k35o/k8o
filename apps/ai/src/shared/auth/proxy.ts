import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isAuthEnabled } from './auth-enabled';

const isDev = process.env.NODE_ENV === 'development';

// img-src に外のホストを入れない。ai は生成物（モデルが書いた spec とデッキ）を同じ文書に
// 描くので、外の画像は、URL に載せた中身を外へ送る口になる
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self';
    frame-src 'none';
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

// /sign-in はリダイレクト先そのもの、/s/ は非ログインでも見られる公開ページ
const isPublicPath = (pathname: string): boolean =>
  pathname === '/sign-in' || pathname.startsWith('/s/');

export const proxy = (request: NextRequest): NextResponse => {
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
