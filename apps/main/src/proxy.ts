import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: blob: data:;
    font-src 'self';
    worker-src 'self' blob:;
    connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://va.vercel-scripts.com https://api.webstatus.dev https://api.k8o.me${isDev ? ' https://api.k8o.localhost:* https://*.api.k8o.localhost:*' : ''};
    frame-src 'self' https://codepen.io https://www.googletagmanager.com https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : "require-trusted-types-for 'script';"}
    trusted-types nextjs nextjs#bundler goog#html lit-html default;
    report-to csp-endpoint;
    ${
      // Safari/WebKit は localhost の http でも https に強制アップグレードするため、
      // dev では付けない（Chromium は localhost を例外扱いするので気づきにくい）
      isDev ? '' : 'upgrade-insecure-requests;'
    }
`;

const contentSecurityPolicyHeaderValue = cspHeader
  .replaceAll(/\s{2,}/gu, ' ')
  .trim();

export function proxy() {
  const response = NextResponse.next();
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );
  // preview と dev のレポートは、api が Origin を許可しないので受け付けられない
  response.headers.set(
    'Reporting-Endpoints',
    'csp-endpoint="https://api.k8o.me/public/reports"',
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
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
