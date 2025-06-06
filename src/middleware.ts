import { ipAddress } from '@/utils/ipaddress';
import { after, NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/utils/auth/session';

const isDevelopment = process.env.NODE_ENV === 'development';

export async function middleware(request: NextRequest) {
  // 管理者ページのアクセス制御
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 開発環境では従来のIP制限も並行して使用
    if (!isDevelopment) {
      const ip = ipAddress(request);
      const allowedIPs =
        process.env.ADMIN_ALLOWED_IPS?.split(',') ?? [];

      if (!ip || !allowedIPs.includes(ip)) {
        return NextResponse.rewrite(new URL('/404', request.url), {
          status: 404,
          statusText: 'Not Found',
        });
      }
    }

    // 認証ページ以外は認証チェック
    if (!request.nextUrl.pathname.startsWith('/admin/login')) {
      const session = await getSessionFromRequest(request);

      if (
        !session ||
        !session.isAdmin ||
        Date.now() > session.expiresAt
      ) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set(
          'redirect',
          request.nextUrl.pathname,
        );
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 認証APIのCSRF保護
  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    request.method !== 'GET'
  ) {
    // ログインエンドポイントは除外
    if (!request.nextUrl.pathname.includes('/api/auth/login')) {
      const session = await getSessionFromRequest(request);

      if (session) {
        // CSRFトークンチェック
        const csrfHeader = request.headers.get('x-csrf-token');
        const csrfCookie = request.cookies.get('k8o-csrf-token');

        if (
          !csrfHeader ||
          !csrfCookie ||
          csrfHeader !== csrfCookie.value
        ) {
          return NextResponse.json(
            { error: 'CSRF token mismatch' },
            { status: 403 },
          );
        }
      }
    }
  }

  // blog
  if (request.nextUrl.pathname.startsWith('/blog')) {
    const slug = request.nextUrl.pathname.split('/')[2];
    if (slug && slug !== 'feed') {
      after(() => {
        void fetch(`${request.nextUrl.origin}/api/blog/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug }),
        });
      });
    }
  }
  return NextResponse.next();
}
