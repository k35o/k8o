import { after, type NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    img-src 'self' blob: data:;
    font-src 'self';
    worker-src 'self' blob:;
    connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://va.vercel-scripts.com;
    frame-src 'self' https://codepen.io https://www.googletagmanager.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : "require-trusted-types-for 'script';"}
    trusted-types nextjs nextjs#bundler dompurify k8o goog#html lit-html default;
    upgrade-insecure-requests;
`;

const contentSecurityPolicyHeaderValue = cspHeader
  .replace(/\s{2,}/g, ' ')
  .trim();

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

  const response = NextResponse.next();
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
