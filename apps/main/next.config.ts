import withMdx from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  allowedDevOrigins: ['main.k8o.localhost', '*.main.k8o.localhost'],
  pageExtensions: ['tsx', 'mdx', 'ts'],
  rewrites: () =>
    Promise.resolve([
      { source: '/blog/:slug.md', destination: '/blog/md/:slug' },
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
