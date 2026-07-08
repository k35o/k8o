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
      ],
    }),
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
  experimental: {
    viewTransition: true,
    typedEnv: true,
    prefetchInlining: true,
  },
};

export default withMdx({
  options: {
    remarkPlugins: ['remark-math', 'remark-frontmatter'],
    rehypePlugins: ['rehype-katex', '@repo/code-highlight'],
  },
})(nextConfig);
