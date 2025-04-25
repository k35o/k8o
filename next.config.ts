import BundleAnalyzer from '@next/bundle-analyzer';
import withMdx from '@next/mdx';
import rehypeShiki, { RehypeShikiOptions } from '@shikijs/rehype';
import { NextConfig } from 'next';
import rehypeKatex from 'rehype-katex';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'mdx', 'ts'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  experimental: {
    typedRoutes: true,
    viewTransition: true,
  },
};

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(
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
