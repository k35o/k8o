const toHeaderValue = (directives: readonly string[]): string =>
  directives.map((directive) => `${directive};`).join(' ');

const securityHeaders = (isDev: boolean): Readonly<Record<string, string>> => ({
  'Content-Security-Policy': toHeaderValue([
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: blob: data:",
    "font-src 'self'",
    "worker-src 'self' blob:",
    `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me${isDev ? ' https://api.k8o.localhost:* https://*.api.k8o.localhost:*' : ''}`,
    "frame-src 'self' https://codepen.io https://www.googletagmanager.com https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'report-to csp-endpoint',
    // Safari/WebKit は localhost の http でも https に強制アップグレードするため、
    // dev では付けない（Chromium は localhost を例外扱いするので気づきにくい）
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ]),
  // 強制すると、生の文字列を渡す sink が止まる。sink は Report-Only でだけ縛り、違反を集める
  'Content-Security-Policy-Report-Only': toHeaderValue([
    "require-trusted-types-for 'script'",
    'report-to csp-endpoint',
  ]),
  // preview と dev のレポートは、api が Origin を許可しないので受け付けられない
  'Reporting-Endpoints': 'csp-endpoint="https://api.k8o.me/public/reports"',
  'X-Content-Type-Options': 'nosniff',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
});

export const SECURITY_HEADERS = securityHeaders(false);

export const DEV_SECURITY_HEADERS = securityHeaders(true);
