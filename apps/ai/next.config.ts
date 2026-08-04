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
  partialPrefetching: true,
  experimental: {
    typedEnv: true,
    // 16.3 では og-image ルートの prerender が "use cache called after prerender
    // ended" のレースで稀に失敗するため、ページ単位のリトライで緩和する
    staticGenerationRetryCount: 3,
    // Storybook (nextjs-vite) が Turbopack 外で config を読むと検証で落ちるため、
    // next CLI (Turbopack) 実行時だけ有効化する
    ...(process.env['TURBOPACK'] === undefined
      ? {}
      : { turbopackRustReactCompiler: true }),
  },
};

export default nextConfig;
