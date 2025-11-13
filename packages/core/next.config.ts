import withMdx from '@next/mdx';
import rehypeShiki, { type RehypeShikiOptions } from '@shikijs/rehype';
import type { NextConfig } from 'next';
import rehypeKatex from 'rehype-katex';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';
import Sonda from 'sonda/next';

const withSondaAnalyzer = Sonda({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'mdx', 'ts'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  typedRoutes: true,
  experimental: {
    viewTransition: true,
  },
  productionBrowserSourceMaps: process.env.ANALYZE === 'true',
};

export default withSondaAnalyzer(
  withMdx({
    options: {
      remarkPlugins: [remarkMath, remarkFrontmatter],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypeShiki,
          {
            theme: 'plastic',
          } satisfies RehypeShikiOptions,
        ],
      ],
    },
  })(nextConfig),
);
