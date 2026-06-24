import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  allowedDevOrigins: ['ai.k8o.localhost', '*.ai.k8o.localhost'],
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
