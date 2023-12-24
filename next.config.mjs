import withMdx from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
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
    rehypePlugins: [
      [
        rehypePrettyCode,
        /** @type {Partial<import("rehype-pretty-code").Options>} */
        ({
          theme: { dark: "one-dark-pro" },
          getHighlighter,
        }),
      ],
    ],
  },
})(nextConfig);
