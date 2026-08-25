import { createProxy } from '@repo/auth-shell/proxy';

export const proxy = createProxy();

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
    },
  ],
};
