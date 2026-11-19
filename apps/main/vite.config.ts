import { existsSync, readdirSync } from 'node:fs';
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
import type { Plugin, UserConfigFnPromise } from 'vite';

import type * as demoDocument from './src/features/blog/application/demo-document.ts';
import type * as demos from './src/features/blog/application/demos.ts';
import floor from './src/features/browser-support/infrastructure/browser-min-versions.json' with { type: 'json' };
import { COLOR_SCHEME_SCRIPT_OPTIONS } from './src/shared/site/color-scheme-script.ts';
import { blogDemoScripts, demoBundler } from './src/site/blog-demo-scripts.ts';
import type { TsxDemo } from './src/site/blog-demo-scripts.ts';
import { browserTargets } from './src/site/browser-targets.ts';
import { demoAssetsCors } from './src/site/demo-assets.ts';
import { inlineScriptHashes } from './src/site/inline-script-hashes.ts';
import {
  blobStore,
  fillMissingPdfDecks,
  publicSiteStore,
  syncPdfDecks,
} from './src/site/pdf-deck-sync.ts';
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
};

// 設定のバンドルは workspace の @repo/* を外に出し、Node がそのまま読むと拡張子の無い import で落ちるので、
// 記事の例を読むモジュールは Vite の runner で読む。runner はこの設定ファイルを読まず alias を引き継がないので渡す
const importWithAlias = async <T>(path: string): Promise<T> =>
  (
    await runnerImport<T>(fileURLToPath(new URL(path, import.meta.url)), {
      resolve: { alias },
    })
  ).module;

let demosModule: Promise<typeof demos> | undefined;

type ArticleDemo = {
  slug: string;
  demo: ReturnType<typeof demos.readDemos>[number];
};

// dev で記事を直したら束ね直すので、そのつど記事のファイルを読む
const readArticleDemos = async (): Promise<ArticleDemo[]> => {
  demosModule ??= importWithAlias<typeof demos>(
    './src/features/blog/application/demos.ts',
  );
  const { readDemos } = await demosModule;
  const blogDir = join(alias['@content'], 'blog');
  const perArticle = await Promise.all(
    readdirSync(blogDir)
      .filter((slug) => existsSync(join(blogDir, slug, 'article.mdx')))
      .map(async (slug) =>
        readDemos(
          await readFile(join(blogDir, slug, 'article.mdx'), 'utf8'),
        ).map((demo) => ({ slug, demo })),
      ),
  );
  return perArticle.flat();
};

const readTsxDemos = async (): Promise<TsxDemo[]> =>
  (await readArticleDemos())
    .filter(({ demo }) => demo.tsx !== '')
    .map(({ slug, demo }) => ({ slug, name: demo.name, tsx: demo.tsx }));

const bundleTsxDemo = demoBundler({
  root: import.meta.dirname,
  target: targets.build,
});

// 記事の動く例の文書の inline の script を、どのページの <meta> の CSP でも許すハッシュ（pagePolicy）。
// 文書は route.ts と同じ関数で組み立て、tsx は route.ts が読む JS と同じ束ねた結果を使う
const readDemoScriptHashes = async (): Promise<string[]> => {
  const { buildDemoDocument } = await importWithAlias<typeof demoDocument>(
    './src/features/blog/application/demo-document.ts',
  );
  const documents = await Promise.all(
    (await readArticleDemos()).map(async ({ slug, demo }) =>
      buildDemoDocument({
        name: demo.name,
        html: demo.html,
        css: demo.css,
        script:
          demo.tsx === ''
            ? demo.js
            : await bundleTsxDemo({ slug, name: demo.name, tsx: demo.tsx }),
      }),
    ),
  );
  return [...new Set(documents.flatMap(inlineScriptHashes))];
};

const colorSchemeHash = await colorSchemeScriptHash(
  COLOR_SCHEME_SCRIPT_OPTIONS,
);

let pdfDecks: Promise<void> | undefined;

// PDF から作ったデッキの中身は公開のリポジトリに置かず、slug を持つトークのものだけをストアから
// public/talks/<slug>/ へ取り込む。ビルドの初めに済ませ、paths.ts（トークの一覧がマニフェストを読む）と public の
// 写しはそのあとに走る。
// ストアのトークンは slug を入れる前のデッキも読めるので、本番のビルドにだけ渡す。トークンの無い preview と
// 手元は、手元に無いデッキだけを、k8o.me に公開されているファイルから写す。/talks/:slug は値が 1 つも無いと
// ビルドが止まるので、ストアを読めないビルドにも公開済みのデッキを持たせる。upload:talk-deck が手元に書いた
// デッキは置き換えない
// slug を持ち、MDX の無いトーク
const readPdfDeckSlugs = async (): Promise<string[]> => {
  const { getTalks } = await importWithAlias<typeof buildData>(
    import.meta.resolve('@repo/api/build-data'),
  );
  return (await getTalks()).flatMap(({ slug }) =>
    slug === null ||
    existsSync(join(alias['@content'], 'talks', slug, 'content.mdx'))
      ? []
      : [slug],
  );
};

const syncPdfDecksOfTalks = (): Promise<void> => {
  pdfDecks ??= (async () => {
    // workflow は、secret の無い環境にも空の文字列でこの変数を渡す
    const hasToken = Boolean(process.env['BLOB_READ_WRITE_TOKEN']);
    const decksDir = fileURLToPath(new URL('./public/talks', import.meta.url));
    if (hasToken) {
      await syncPdfDecks({
        slugs: await readPdfDeckSlugs(),
        decksDir,
        store: blobStore,
      });
      return;
    }
    if (process.env['DEPLOY_TARGET'] === 'production') {
      const slugs = await readPdfDeckSlugs();
      if (slugs.length > 0) {
        throw new Error(
          `BLOB_READ_WRITE_TOKEN が無く、PDF のデッキを取り込めない: ${slugs.join(', ')}`,
        );
      }
      return;
    }
    // DB や k8o.me に届かなくても、手元にあるデッキで dev とビルドを進める
    try {
      await fillMissingPdfDecks({
        slugs: await readPdfDeckSlugs(),
        decksDir,
        store: publicSiteStore('https://k8o.me'),
      });
    } catch (error) {
      console.warn('k8o.me から公開済みのデッキを写せなかった', error);
    }
  })();
  return pdfDecks;
};

const pdfDeckSync: Plugin = {
  name: 'k8o:pdf-deck-sync',
  buildStart: syncPdfDecksOfTalks,
};

const config: UserConfigFnPromise = async ({ command, isPreview }) => ({
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
    pdfDeckSync,
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
      // dev の HTML は <meta> の CSP を持たないので、例を束ねてハッシュを取るのはビルドのときだけ
      csp: pagePolicy(
        deployTarget,
        colorSchemeHash,
        command === 'build' ? await readDemoScriptHashes() : [],
      ),
    }),
    vercel({
      beforeFiles: BEFORE_FILES,
      beforeNotFound: BEFORE_NOT_FOUND,
    }),
    betterCssModules(),
    blogDemoScripts(readTsxDemos, bundleTsxDemo),
    demoAssetsCors,
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

export default defineConfig(config);
