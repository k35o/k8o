import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

import betterCssModules from '@better-css-modules/vite';
import { vercel } from '@k8ordo/framework/vercel';
import { framework } from '@k8ordo/framework/vite';
import mdx from '@mdx-js/rollup';
import rehypePreset from '@repo/mdx-preset/rehype';
import remarkPreset from '@repo/mdx-preset/remark';
import { defineConfig, runnerImport } from 'vite';
import type { Plugin } from 'vite';

import floor from '../main/src/features/browser-support/infrastructure/browser-min-versions.json' with { type: 'json' };
import { playgroundIds } from '../main/src/playgrounds/ids.ts';
import type * as blogs from './src/features/blog/application/blogs.ts';
import { browserTargets } from './src/site/browser-targets.ts';
import { katexCssGuard } from './src/site/katex-css-guard.ts';
import {
  blogPathnames,
  playgroundPathnames,
  writesPage,
} from './src/site/paths.ts';
import type { BlogArticle } from './src/site/paths.ts';
import { DEV_SECURITY_HEADERS } from './src/site/security-headers.ts';
import { BEFORE_FILES, BEFORE_NOT_FOUND } from './src/site/vercel-routes.ts';

// Vite は .env.local を process.env に読み込まない。ビルドの描画はサーバーの部品が process.env を読む。
// Vercel と CI は env を外から渡すので、ファイルが無くても動かす
const envFile = fileURLToPath(new URL('.env.local', import.meta.url));
if (existsSync(envFile)) {
  loadEnvFile(envFile);
}

const targets = browserTargets(floor.minVersions);

const contentDir = fileURLToPath(
  new URL('../main/src/content', import.meta.url),
);

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
  '@content': contentDir,
  '@playgrounds': fileURLToPath(
    new URL('../main/src/playgrounds', import.meta.url),
  ),
};

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

const readArticles = async (): Promise<BlogArticle[]> => {
  // 設定のバンドルは @repo/database を外に出し、Node がそのまま読むと拡張子の無い import で
  // 落ちるので、DB を読むモジュールは Vite の runner で読む。runner はこの設定ファイルを読まず
  // alias を引き継がないので渡す
  const { module } = await runnerImport<typeof blogs>(
    fileURLToPath(
      new URL('src/features/blog/application/blogs.ts', import.meta.url),
    ),
    { resolve: { alias } },
  );
  return Promise.all(
    (await module.getBlogs()).map(async ({ slug }) => ({
      slug,
      mdx: await readFile(
        join(contentDir, 'blog', slug, 'article.mdx'),
        'utf8',
      ),
    })),
  );
};

export default defineConfig({
  // 記事・デモ・public は写さず apps/main のものを読む
  publicDir: fileURLToPath(new URL('../main/public', import.meta.url)),
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
    // site は渡さない。渡すと framework の sitemap.xml が route.ts の sitemap.xml を上書きする
    framework({
      mode: 'static',
      reactCompiler: true,
      paths: async (patterns) => [
        ...blogPathnames(patterns, await readArticles()),
        ...playgroundPathnames(patterns, playgroundIds),
      ],
    }),
    vercel({ beforeFiles: BEFORE_FILES, beforeNotFound: BEFORE_NOT_FOUND }),
    // vercel() が .vercel/output を書いたあとに見るので、framework() と vercel() より後に置く
    katexCssGuard(async () => (await readArticles()).filter(writesPage)),
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
