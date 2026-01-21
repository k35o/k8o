import withMdx from '@next/mdx';
import type { RehypeShikiOptions } from '@shikijs/rehype';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'mdx', 'ts'],
  compiler: {
    removeConsole: process.env['NODE_ENV'] === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  typedRoutes: true,
  cacheComponents: true,
  experimental: {
    viewTransition: true,
    typedEnv: true,
  },
  productionBrowserSourceMaps: process.env['ANALYZE'] === 'true',
};

export default withMdx({
  options: {
    remarkPlugins: ['remark-math', 'remark-frontmatter'],
    rehypePlugins: [
      'rehype-katex',
      ['@shikijs/rehype', { theme: 'plastic' } satisfies RehypeShikiOptions],
    ],
  },
})(nextConfig);
