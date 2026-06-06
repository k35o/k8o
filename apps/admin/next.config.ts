import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  // portless の worktree サブドメイン（<branch>.admin.k8o.localhost）からの
  // dev リクエストを許可する。dev のみ有効で本番では無視される。
  allowedDevOrigins: ['admin.k8o.localhost', '*.admin.k8o.localhost'],
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

export default nextConfig;
