import { fileURLToPath } from 'node:url';

import betterCssModules from '@better-css-modules/vite';
import { colorSchemeScriptHash } from '@k8ordo/color-scheme';
import { vercel } from '@k8ordo/framework/vercel';
import { framework } from '@k8ordo/framework/vite';
import mdx from '@mdx-js/rollup';
import rehypePreset from '@repo/mdx-preset/rehype';
import remarkPreset from '@repo/mdx-preset/remark';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

import floor from './src/features/browser-support/infrastructure/browser-min-versions.json' with { type: 'json' };
import { COLOR_SCHEME_SCRIPT_OPTIONS } from './src/shared/site/color-scheme-script.ts';
import { browserTargets } from './src/site/browser-targets.ts';
import { pagePolicy, securityHeaders } from './src/site/security-headers.ts';
import type { DeployTarget } from './src/site/security-headers.ts';
import { BEFORE_NOT_FOUND, beforeFiles } from './src/site/vercel-routes.ts';

const targets = browserTargets(floor.minVersions);

// vercel build は VERCEL_ENV を自分では付けないので、vercel-prebuilt.yml の deploy の job が
// 付ける DEPLOY_TARGET で preview のビルドを見分ける
const deployTarget: DeployTarget =
  process.env['DEPLOY_TARGET'] === 'preview' ? 'preview' : 'production';

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
  '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
  '@playgrounds': fileURLToPath(new URL('./src/playgrounds', import.meta.url)),
};

// vercel() の規則は Vercel だけが当てる。server.headers は Vite 自身の応答にしか付かず、
// framework が描く HTML に届かないので、dev のヘッダーはどの応答にも先に付ける
const devSecurityHeaders: Plugin = {
  name: 'k8o:dev-security-headers',
  apply: 'serve',
  configureServer(server) {
    const headers = Object.entries(securityHeaders('development'));
    server.middlewares.use((_req, res, next) => {
      for (const [name, value] of headers) {
        res.setHeader(name, value);
      }
      next();
    });
  },
};

export default defineConfig({
  resolve: { alias },
  // @repo/helpers は in-source のテストを持つ。置き換えないとテストの本体が client のバンドルに残る
  define: { 'import.meta.vitest': 'undefined' },
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
    // framework() の React と plugin-rsc より先に、MDX を JSX にする
    {
      enforce: 'pre',
      ...mdx({ remarkPlugins: [remarkPreset], rehypePlugins: [rehypePreset] }),
    },
    framework({
      mode: 'static',
      reactCompiler: true,
      csp: pagePolicy(
        deployTarget,
        await colorSchemeScriptHash(COLOR_SCHEME_SCRIPT_OPTIONS),
      ),
    }),
    vercel({
      beforeFiles: beforeFiles(deployTarget),
      beforeNotFound: BEFORE_NOT_FOUND,
    }),
    betterCssModules(),
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: { targets: targets.lightningcss },
  },
  build: {
    target: targets.build,
    // CSP の font-src は 'self' だけなので、小さなフォントも data: URI に埋め込まずファイルで配る
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
});
