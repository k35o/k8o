import withMdx from "@next/mdx";
import BundleAnalyzer from '@next/bundle-analyzer';
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { createHighlighter, createJavaScriptRegexEngine } from "shiki";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'mdx'],
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
      remarkPlugins: [
        remarkMath,
      ],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypePrettyCode,
          /** @type {Partial<import("rehype-pretty-code").Options>} */
          ({
            theme: "one-dark-pro",
            createHighlighter: (options) => {
              createHighlighter({
                ...options,
                engine: createJavaScriptRegexEngine(),
              })
            },
          }),
        ],
      ],
    },
  })(nextConfig)
);
