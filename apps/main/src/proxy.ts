import { after, type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // blog
  if (request.nextUrl.pathname.startsWith('/blog')) {
    const paths = request.nextUrl.pathname.split('/');
    const slug = paths[2];
    if (slug && slug !== 'feed' && paths.length === 3) {
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
