import { createProxy } from '@repo/auth-shell/proxy';

// 公開共有ページは非ログインでも見られる（認証を通さない）。
export const proxy = createProxy(['/s/']);

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
    },
  ],
};
