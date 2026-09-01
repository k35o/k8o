import withMdx from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
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
  redirects: () =>
    Promise.resolve([
      // 旧 /baseline は /browser-support へ恒久リダイレクト（既存リンク・ブックマーク互換）
      {
        source: '/baseline',
        destination: '/browser-support',
        permanent: true,
      },
    ]),
  compiler: {
    removeConsole: process.env['NODE_ENV'] === 'production' && {
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
    // Storybook (nextjs-vite) が Turbopack 外で config を読むと検証で落ちるため、
    // next CLI (Turbopack) 実行時だけ有効化する
    ...(process.env['TURBOPACK'] === undefined
      ? {}
      : { turbopackRustReactCompiler: true }),
  },
};

export default withMdx({
  options: {
    remarkPlugins: ['remark-math', 'remark-frontmatter'],
    rehypePlugins: ['rehype-katex', '@repo/code-highlight'],
  },
})(nextConfig);
