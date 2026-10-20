import { withBetterCssModules } from '@better-css-modules/turbopack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  allowedDevOrigins: ['ai.k8o.localhost', '*.ai.k8o.localhost'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  logging: {
    browserToTerminal: true,
  },
  typedRoutes: true,
  redirects: () => [{ source: '/', destination: '/chat', permanent: false }],
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    typedEnv: true,
    useOffline: true,
    turbopackRustReactCompiler: true,
  },
};

export default withBetterCssModules(nextConfig);
