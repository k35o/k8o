export type DeployTarget = 'preview' | 'production';

type SiteEnvironment = 'development' | DeployTarget;

const toHeaderValue = (directives: readonly string[]): string =>
  directives.map((directive) => `${directive};`).join(' ');

// Vercel は preview の HTML にだけ Toolbar を差し込む
const toolbarOf = (environment: SiteEnvironment): string[] =>
  environment === 'preview' ? ['https://vercel.live'] : [];

const scriptHostsOf = (environment: SiteEnvironment): string[] => [
  'https://www.googletagmanager.com',
  ...toolbarOf(environment),
];

export const securityHeaders = (
  environment: SiteEnvironment,
): Readonly<Record<string, string>> => {
  const isDev = environment === 'development';
  return {
    'Content-Security-Policy': toHeaderValue([
      "default-src 'self'",
      // 頭はページごとのハッシュを持てないので、inline の script は <meta> の CSP（pagePolicy）で縛る
      [
        "script-src 'self' 'unsafe-inline'",
        ...scriptHostsOf(environment),
        ...(isDev ? ["'unsafe-eval'"] : []),
      ].join(' '),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: blob: data:",
      "font-src 'self'",
      "worker-src 'self' blob:",
      `connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.k8o.me${isDev ? ' https://api.k8o.localhost:* https://*.api.k8o.localhost:*' : ''}`,
      [
        "frame-src 'self' https://codepen.io https://www.googletagmanager.com",
        ...toolbarOf(environment),
      ].join(' '),
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'report-to csp-endpoint',
      // Safari/WebKit は localhost の http でも https に強制アップグレードするため、
      // dev では付けない（Chromium は localhost を例外扱いするので気づきにくい）
      ...(isDev ? [] : ['upgrade-insecure-requests']),
    ]),
    // 強制すると、生の文字列を渡す sink が止まる。sink とポリシーを作るものは Report-Only でだけ縛り、
    // 違反を集める
    'Content-Security-Policy-Report-Only': toHeaderValue([
      "require-trusted-types-for 'script'",
      "trusted-types 'none'",
      'report-to csp-endpoint',
    ]),
    // preview と dev のレポートは、api が Origin を許可しないので受け付けられない
    'Reporting-Endpoints': 'csp-endpoint="https://api.k8o.me/public/reports"',
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  };
};

// framework() が書き出す各ページの <meta> の CSP。framework は payload と React の inline の script の
// ハッシュを足すので、ここにはアプリの inline の script（テーマ）のハッシュだけを渡す
export const pagePolicy = (
  environment: DeployTarget,
  colorSchemeScriptHash: string,
): Readonly<Record<string, readonly string[]>> => ({
  'script-src': [
    "'self'",
    colorSchemeScriptHash,
    ...scriptHostsOf(environment),
  ],
});
