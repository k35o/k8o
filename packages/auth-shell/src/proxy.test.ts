import { NextRequest } from 'next/server';

import { createProxy } from './proxy';

const request = (pathname: string): NextRequest =>
  new NextRequest(`https://admin.k8o.me${pathname}`);

const signedInRequest = (pathname: string): NextRequest => {
  const signedIn = request(pathname);
  // https 越しの better-auth は __Secure- 付きの cookie 名を読む
  signedIn.cookies.set('__Secure-better-auth.session_token', 'dummy-token');
  return signedIn;
};

describe('createProxy', () => {
  describe('正常系', () => {
    it('セッションcookieが無いと/sign-inへリダイレクトする', () => {
      const response = createProxy()(request('/blogs'));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'https://admin.k8o.me/sign-in',
      );
    });

    it('/sign-in自体は認証を通さない', () => {
      expect(
        createProxy()(request('/sign-in')).headers.get('location'),
      ).toBeNull();
    });

    it('publicPathPrefixesに前方一致するパスは認証を通さない', () => {
      const proxy = createProxy(['/s/']);

      expect(proxy(request('/s/abc')).headers.get('location')).toBeNull();
    });

    it('セッションcookieがあれば保護パスを通す', () => {
      expect(
        createProxy()(signedInRequest('/blogs')).headers.get('location'),
      ).toBeNull();
    });

    it('セキュリティヘッダを常に付ける', () => {
      const { headers } = createProxy()(request('/blogs'));

      expect(headers.get('Content-Security-Policy')).toContain(
        "frame-ancestors 'none'",
      );
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headers.get('Referrer-Policy')).toBe('same-origin');
    });
  });

  describe('異常系', () => {
    it('認証が無効なら素通しするがセキュリティヘッダは落とさない', async () => {
      vi.resetModules();
      vi.doMock('./auth-enabled', () => ({ isAuthEnabled: false }));
      try {
        const { createProxy: createProxyWithoutAuth } = await import('./proxy');
        const response = createProxyWithoutAuth()(request('/blogs'));

        expect(response.headers.get('location')).toBeNull();
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      } finally {
        vi.doUnmock('./auth-enabled');
        vi.resetModules();
      }
    });
  });

  describe('エッジケース', () => {
    it('publicPathPrefixesを渡さないアプリでは他アプリの公開パスも保護する', () => {
      expect(createProxy()(request('/s/abc')).headers.get('location')).toBe(
        'https://admin.k8o.me/sign-in',
      );
    });

    it('前方一致であって部分一致ではない', () => {
      const proxy = createProxy(['/s/']);

      expect(proxy(request('/blogs/s/abc')).headers.get('location')).toBe(
        'https://admin.k8o.me/sign-in',
      );
    });
  });
});
