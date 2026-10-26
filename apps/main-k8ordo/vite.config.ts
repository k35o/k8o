import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

import betterCssModules from '@better-css-modules/vite';
import { vercel } from '@k8ordo/framework/vercel';
import { framework } from '@k8ordo/framework/vite';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

import floor from '../main/src/features/browser-support/infrastructure/browser-min-versions.json' with { type: 'json' };
import { browserTargets } from './src/site/browser-targets.ts';
import { DEV_SECURITY_HEADERS } from './src/site/security-headers.ts';
import { BEFORE_FILES, BEFORE_NOT_FOUND } from './src/site/vercel-routes.ts';

// Vite は .env.local を process.env に読み込まない。ビルドの描画はサーバーの部品が process.env を読む。
// Vercel と CI は env を外から渡すので、ファイルが無くても動かす
const envFile = fileURLToPath(new URL('.env.local', import.meta.url));
if (existsSync(envFile)) {
  loadEnvFile(envFile);
}

const targets = browserTargets(floor.minVersions);

// vercel() の規則は Vercel だけが当てる。server.headers は Vite 自身の応答にしか付かず、
// framework が描く HTML に届かないので、dev のヘッダーはどの応答にも先に付ける
const devSecurityHeaders: Plugin = {
  name: 'k8o:dev-security-headers',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      for (const [name, value] of Object.entries(DEV_SECURITY_HEADERS)) {
        res.setHeader(name, value);
      }
      next();
    });
  },
};

export default defineConfig({
  // 記事・デモ・public は写さず apps/main のものを読む
  publicDir: fileURLToPath(new URL('../main/public', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@playgrounds': fileURLToPath(
        new URL('../main/src/playgrounds', import.meta.url),
      ),
    },
  },
  server: {
    port: Number(process.env['PORT']) || 5173,
    // vercel() の中継は Vercel だけが当てるので、dev ではここで中継する
    proxy: {
      '^/reading-list/feed(?:\\?|$)': {
        target: 'https://api.k8o.me',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/reading-list\/feed/u, '/public/reading-list/feed'),
      },
    },
  },
  plugins: [
    devSecurityHeaders,
    // site は渡さない。渡すと framework の sitemap.xml が route.ts の sitemap.xml を上書きする
    framework({ mode: 'static', reactCompiler: true }),
    vercel({ beforeFiles: BEFORE_FILES, beforeNotFound: BEFORE_NOT_FOUND }),
    betterCssModules(),
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: { targets: targets.lightningcss },
  },
  build: { target: targets.build },
});
