import { existsSync, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import betterCssModules from '@better-css-modules/vite';
import { colorSchemeScriptHash } from '@k8ordo/color-scheme';
import { vercel } from '@k8ordo/framework/vercel';
import { framework } from '@k8ordo/framework/vite';
import mdx from '@mdx-js/rollup';
import rehypePreset from '@repo/mdx-preset/rehype';
import remarkPreset from '@repo/mdx-preset/remark';
import { defineConfig, runnerImport } from 'vite';

import type * as demos from './src/features/blog/application/demos.ts';
import floor from './src/features/browser-support/infrastructure/browser-min-versions.json' with { type: 'json' };
import { COLOR_SCHEME_SCRIPT_OPTIONS } from './src/shared/site/color-scheme-script.ts';
import { blogDemoScripts } from './src/site/blog-demo-scripts.ts';
import type { TsxDemo } from './src/site/blog-demo-scripts.ts';
import { browserTargets } from './src/site/browser-targets.ts';
import { pagePolicy, securityHeaders } from './src/site/security-headers.ts';
import type { DeployTarget } from './src/site/security-headers.ts';
import { BEFORE_FILES, BEFORE_NOT_FOUND } from './src/site/vercel-routes.ts';

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

// 設定のバンドルは workspace の @repo/* を外に出し、Node がそのまま読むと拡張子の無い import で落ちるので、
// 記事の例を読むモジュールは Vite の runner で読む。runner はこの設定ファイルを読まず alias を引き継がないので渡す
let demosModule: Promise<typeof demos> | undefined;

const readDemosOf = async (
  source: string,
): Promise<ReturnType<typeof demos.readDemos>> => {
  demosModule ??= runnerImport<typeof demos>(
    fileURLToPath(
      new URL('./src/features/blog/application/demos.ts', import.meta.url),
    ),
    { resolve: { alias } },
  ).then(({ module }) => module);
  return (await demosModule).readDemos(source);
};

// dev で記事を直したら束ね直すので、そのつど記事のファイルを読む
const readTsxDemos = async (): Promise<TsxDemo[]> => {
  const blogDir = join(alias['@content'], 'blog');
  const perArticle = await Promise.all(
    readdirSync(blogDir)
      .filter((slug) => existsSync(join(blogDir, slug, 'article.mdx')))
      .map(async (slug) =>
        (
          await readDemosOf(
            await readFile(join(blogDir, slug, 'article.mdx'), 'utf8'),
          )
        )
          .filter(({ tsx }) => tsx !== '')
          .map(({ name, tsx }) => ({ slug, name, tsx })),
      ),
  );
  return perArticle.flat();
};

const colorSchemeHash = await colorSchemeScriptHash(
  COLOR_SCHEME_SCRIPT_OPTIONS,
);

export default defineConfig(({ command, isPreview }) => ({
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
    // framework() の React と plugin-rsc より先に、MDX を JSX にする
    {
      enforce: 'pre',
      ...mdx({ remarkPlugins: [remarkPreset], rehypePlugins: [rehypePreset] }),
    },
    framework({
      mode: 'static',
      reactCompiler: true,
      // vite dev だけ dev の値にする。vite preview はビルドと同じ値を送る
      headers: securityHeaders(
        command === 'serve' && isPreview !== true
          ? 'development'
          : deployTarget,
      ),
      csp: pagePolicy(deployTarget, colorSchemeHash),
    }),
    vercel({
      beforeFiles: BEFORE_FILES,
      beforeNotFound: BEFORE_NOT_FOUND,
    }),
    betterCssModules(),
    blogDemoScripts(readTsxDemos, {
      root: import.meta.dirname,
      target: targets.build,
    }),
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
}));
