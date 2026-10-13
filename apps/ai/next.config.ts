import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
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
  partialPrefetching: true,
  experimental: {
    typedEnv: true,
    useOffline: true,
    turbopackRustReactCompiler: true,
  },
};

export default nextConfig;
