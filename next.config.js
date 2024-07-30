import withMdx from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { getHighlighter } from "shiki";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'mdx'],
  experimental: {
    typedRoutes: true,
  },
};

export default withMdx({
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
          getHighlighter,
        }),
      ],
    ],
  },
})(nextConfig);
