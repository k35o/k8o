import { type NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

function getOrigin(): string {
  const portlessUrl = process.env['PORTLESS_URL'];
  if (portlessUrl !== undefined && portlessUrl !== '') {
    return portlessUrl.replace(/^http:/, 'https:');
  }
  const vercelUrl = process.env['VERCEL_URL'];
  if (vercelUrl !== undefined && vercelUrl !== '') {
    return `https://${vercelUrl}`;
  }
  return 'https://k8o.me';
}

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    img-src 'self' https: blob: data:;
    font-src 'self' https://cdn.jsdelivr.net;
    worker-src 'self' blob:;
    connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://va.vercel-scripts.com https://api.webstatus.dev;
    frame-src 'self' https://codepen.io https://www.googletagmanager.com https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : "require-trusted-types-for 'script';"}
    trusted-types nextjs nextjs#bundler dompurify k8o goog#html lit-html default;
    report-to csp-endpoint;
    upgrade-insecure-requests;
`;

const contentSecurityPolicyHeaderValue = cspHeader
  .replaceAll(/\s{2,}/g, ' ')
  .trim();

export function proxy(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );
  response.headers.set(
    'Reporting-Endpoints',
    `csp-endpoint="${getOrigin()}/api/reports"`,
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
