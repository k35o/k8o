import withMdx from '@next/mdx';
import BundleAnalyzer from '@next/bundle-analyzer';
import rehypePrettyCode, { Options } from 'rehype-pretty-code';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import {
  createJavaScriptRegexEngine,
  getSingletonHighlighter,
} from 'shiki';
import { NextConfig } from 'next';

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
