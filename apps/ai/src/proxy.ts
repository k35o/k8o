export { proxy } from '@/shared/auth/proxy';

// config は Next が静的に読むので、re-export せずにこのファイルに書く
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
    },
  ],
};
