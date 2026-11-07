import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { proxy } from './proxy';

const request = (pathname: string): NextRequest =>
  new NextRequest(`https://ai.k8o.me${pathname}`);

const signedInRequest = (pathname: string): NextRequest => {
  const signedIn = request(pathname);
  // https 越しの better-auth は __Secure- 付きの cookie 名を読む
  signedIn.cookies.set('__Secure-better-auth.session_token', 'dummy-token');
  return signedIn;
};

describe('proxy', () => {
  describe('正常系', () => {
    it('セッションcookieが無いと/sign-inへリダイレクトする', () => {
      const response = proxy(request('/blogs'));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'https://ai.k8o.me/sign-in',
      );
    });

    it('/sign-in自体は認証を通さない', () => {
      expect(proxy(request('/sign-in')).headers.get('location')).toBeNull();
    });

    it('公開ページ（/s/）は認証を通さない', () => {
      expect(proxy(request('/s/abc')).headers.get('location')).toBeNull();
    });

    it('セッションcookieがあれば保護パスを通す', () => {
      expect(
        proxy(signedInRequest('/blogs')).headers.get('location'),
      ).toBeNull();
    });

    it('セキュリティヘッダを常に付ける', () => {
      const { headers } = proxy(request('/blogs'));

      expect(headers.get('Content-Security-Policy')).toContain(
        "frame-ancestors 'none'",
      );
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headers.get('Referrer-Policy')).toBe('same-origin');
    });

    it.each([
      ['公開パス', proxy(request('/s/abc'))],
      ['ログイン済み', proxy(signedInRequest('/blogs'))],
      ['未ログインのリダイレクト', proxy(request('/blogs'))],
    ])(
      '%sの応答でも、画像は自分のオリジンと data:・blob: からだけ読む',
      (_, { headers }) => {
        const imgSrc = headers
          .get('Content-Security-Policy')
          ?.split(';')
          .map((directive) => directive.trim())
          .find((directive) => directive.startsWith('img-src '));

        expect(imgSrc).toBe("img-src 'self' blob: data:");
      },
    );
  });

  describe('異常系', () => {
    it('認証が無効なら素通しするがセキュリティヘッダは落とさない', async () => {
      vi.resetModules();
      vi.doMock('./auth-enabled', () => ({ isAuthEnabled: false }));
      try {
        const { proxy: proxyWithoutAuth } = await import('./proxy');
        const response = proxyWithoutAuth(request('/blogs'));

        expect(response.headers.get('location')).toBeNull();
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      } finally {
        vi.doUnmock('./auth-enabled');
        vi.resetModules();
      }
    });
  });

  describe('エッジケース', () => {
    it('公開ページは前方一致であって部分一致ではない', () => {
      expect(proxy(request('/blogs/s/abc')).headers.get('location')).toBe(
        'https://ai.k8o.me/sign-in',
      );
    });
  });
});
