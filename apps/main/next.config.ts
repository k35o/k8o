import { fileURLToPath } from 'node:url';

import { withBetterCssModules } from '@better-css-modules/turbopack';
import withMdx from '@next/mdx';
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const trustedTypePolicyNames = 'nextjs nextjs#bundler goog#html lit-html';

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
    trusted-types ${trustedTypePolicyNames} default;
    report-to csp-endpoint;
    ${
      // Safari/WebKit は localhost の http でも https に強制アップグレードするため、
      // dev では付けない（Chromium は localhost を例外扱いするので気づきにくい）
      isDev ? '' : 'upgrade-insecure-requests;'
    }
`;

// require-trusted-types-for を強制すると、生の文字列を渡す sink を通すために default
// ポリシーが要る。default があると違反の判定より先にその変換が効き、Report-Only でも
// sink の違反が上がらない。default を作らず、sink は Report-Only でだけ縛る
const cspReportOnlyHeader = `
    ${isDev ? '' : "require-trusted-types-for 'script';"}
    trusted-types ${trustedTypePolicyNames};
    report-to csp-endpoint;
`;

const toHeaderValue = (policy: string): string =>
  policy.replaceAll(/\s{2,}/gu, ' ').trim();

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  allowedDevOrigins: ['main.k8o.localhost', '*.main.k8o.localhost'],
  pageExtensions: ['tsx', 'mdx', 'ts'],
  rewrites: () =>
    Promise.resolve({
      // 記事ページ (/blog/:slug) より先に評価させるため beforeFiles に置く
      beforeFiles: [
        { source: '/blog/:slug.md', destination: '/blog/md/:slug' },
        {
          // HTML 側の /blog/:slug に Vary: Accept は付けられない (App Router
          // ページの Vary は Next が自前管理しており、headers() や proxy で
          // 付けてもレンダリング時に上書きされる)。Vercel ではこの rewrite が
          // キャッシュ参照前のルーティング層で解決され、markdown 側レスポンス
          // には Vary: Accept が付くため、キャッシュ汚染は起きない
          source: '/blog/:slug((?!feed$|md$)[a-z0-9-]+)',
          destination: '/blog/md/:slug',
          has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
        },
        {
          // トップページも Accept: text/markdown でサイト索引の markdown を返す
          source: '/',
          destination: '/md/home',
          has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
        },
      ],
      // どのルートにも一致しなかったパスへの markdown 要求には、404 ページの
      // 描画に入る前に回復手段（索引・サイトマップ）を載せた markdown を返す
      fallback: [
        {
          source: '/:path*',
          destination: '/md/not-found',
          has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
        },
      ],
    }),
  headers: () =>
    Promise.resolve([
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: toHeaderValue(cspHeader),
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: toHeaderValue(cspReportOnlyHeader),
          },
          // preview と dev のレポートは、api が Origin を許可しないので受け付けられない
          {
            key: 'Reporting-Endpoints',
            value: 'csp-endpoint="https://api.k8o.me/public/reports"',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ]),
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  logging: {
    browserToTerminal: true,
  },
  typedRoutes: true,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    typedEnv: true,
    useOffline: true,
    // 16.3 では og-image ルートの prerender が "use cache called after prerender
    // ended" のレースで稀に失敗するため、ページ単位のリトライで緩和する
    staticGenerationRetryCount: 3,
    turbopackRustReactCompiler: true,
  },
};

// withBetterCssModules は async の config 関数を返すので、オブジェクトしか受けない
// withMdx の外側に置く
export default withBetterCssModules(
  withMdx({
    options: {
      remarkPlugins: ['remark-math', 'remark-frontmatter'],
      rehypePlugins: [
        // @next/mdx は文字列のプラグインを MDX ファイルの場所から require.resolve するので、
        // apps/main のファイルは絶対パスで渡す
        fileURLToPath(
          new URL('./src/shared/mdx/rehype-math.ts', import.meta.url),
        ),
        '@repo/code-highlight',
      ],
    },
  })(nextConfig),
);
