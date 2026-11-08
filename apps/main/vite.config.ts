import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import betterCssModules from '@better-css-modules/vite';
import { colorSchemeScriptHash } from '@k8ordo/color-scheme';
import { vercel } from '@k8ordo/framework/vercel';
import { framework } from '@k8ordo/framework/vite';
import mdx from '@mdx-js/rollup';
import type * as buildData from '@repo/api/build-data';
import rehypePreset from '@repo/mdx-preset/rehype';
import remarkPreset from '@repo/mdx-preset/remark';
import { defineConfig, runnerImport } from 'vite';
import type { Plugin } from 'vite';

import type * as blogs from './src/features/blog/application/blogs.ts';
import floor from './src/features/browser-support/infrastructure/browser-min-versions.json' with { type: 'json' };
import type * as slides from './src/features/slides/application/slides.ts';
import { playgroundIds } from './src/playgrounds/ids.ts';
import { COLOR_SCHEME_SCRIPT_OPTIONS } from './src/shared/site/color-scheme-script.ts';
import { browserTargets } from './src/site/browser-targets.ts';
import { katexCssGuard } from './src/site/katex-css-guard.ts';
import type { BlogArticle } from './src/site/katex-css-guard.ts';
import { expandPathnames } from './src/site/paths.ts';
import { pagePolicy, securityHeaders } from './src/site/security-headers.ts';
import type { DeployTarget } from './src/site/security-headers.ts';
import { BEFORE_NOT_FOUND, beforeFiles } from './src/site/vercel-routes.ts';

const targets = browserTargets(floor.minVersions);

// vercel build は VERCEL_ENV を自分では付けないので、vercel-prebuilt.yml の deploy の job が
// 付ける DEPLOY_TARGET で preview のビルドを見分ける
const deployTarget: DeployTarget =
  process.env['DEPLOY_TARGET'] === 'preview' ? 'preview' : 'production';

const contentDir = fileURLToPath(new URL('./src/content', import.meta.url));

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
  '@content': contentDir,
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

// 設定のバンドルは workspace の @repo/* を外に出し、Node がそのまま読むと拡張子の無い import で落ちるので、
// 記事の一覧と api を読むモジュールは Vite の runner で読む。runner はこの設定ファイルを読まず alias を
// 引き継がないので渡す
const importWithRunner = async <Module>(url: string): Promise<Module> =>
  (await runnerImport<Module>(fileURLToPath(url), { resolve: { alias } }))
    .module;

let articles: Promise<BlogArticle[]> | undefined;

// paths と katexCssGuard が読むので、1 回のビルドで 1 度だけ読む
const readArticles = (): Promise<BlogArticle[]> => {
  articles ??= importWithRunner<typeof blogs>(
    new URL('src/features/blog/application/blogs.ts', import.meta.url).href,
  ).then(async ({ getBlogs }) =>
    Promise.all(
      (await getBlogs()).map(async ({ slug }) => ({
        slug,
        mdx: await readFile(
          join(contentDir, 'blog', slug, 'article.mdx'),
          'utf8',
        ),
      })),
    ),
  );
  return articles;
};

const readTagIds = async (): Promise<number[]> => {
  const { getTags } = await importWithRunner<typeof buildData>(
    import.meta.resolve('@repo/api/build-data'),
  );
  return (await getTags()).map(({ id }) => id);
};

const readSlideSlugs = async (): Promise<string[]> => {
  const { getSlides } = await importWithRunner<typeof slides>(
    new URL('src/features/slides/application/slides.ts', import.meta.url).href,
  );
  return (await getSlides()).map(({ slug }) => slug);
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
      paths: async (patterns) => [
        ...expandPathnames(
          patterns,
          '/blog/:slug',
          (await readArticles()).map(({ slug }) => slug),
        ),
        ...expandPathnames(patterns, '/playgrounds/:id', playgroundIds),
        ...expandPathnames(patterns, '/tags/:id', await readTagIds()),
        ...expandPathnames(patterns, '/slides/:slug', await readSlideSlugs()),
      ],
    }),
    vercel({
      beforeFiles: beforeFiles(deployTarget),
      beforeNotFound: BEFORE_NOT_FOUND,
    }),
    // vercel() が .vercel/output を書いたあとに見るので、framework() と vercel() より後に置く
    katexCssGuard(readArticles),
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
