import BundleAnalyzer from '@next/bundle-analyzer';
import withMdx from '@next/mdx';
import { NextConfig } from 'next';
import rehypeKatex from 'rehype-katex';
import { rehypePrettyCode, Options } from 'rehype-pretty-code';
import remarkMath from 'remark-math';
import {
  createJavaScriptRegexEngine,
  getSingletonHighlighter,
} from 'shiki';

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
  },
};

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(
  withMdx({
    options: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypePrettyCode,
          {
            theme: 'one-dark-pro',
            getHighlighter: (options) =>
              getSingletonHighlighter({
                ...options,
                engine: createJavaScriptRegexEngine(),
              }),
          } satisfies Options,
        ],
      ],
    },
  })(nextConfig),
);
