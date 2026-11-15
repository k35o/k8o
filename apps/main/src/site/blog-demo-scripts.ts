import { build } from 'vite';
import type { Plugin, Rolldown } from 'vite';

export type TsxDemo = { slug: string; name: string; tsx: string };

type BundleOptions = { root: string; target: string | string[] };

const ENTRY_ID = 'k8o-demo:entry.js';
const APP_ID = 'k8o-demo:app.tsx';
const ALLOWED_IMPORT = /^react(?:-dom)?(?:\/|$)/u;

// 記事の tsx は部品を export default で書く。描く場所はどの例でも同じなので、ここで足す
const ENTRY = `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from '${APP_ID}';

const container = document.createElement('div');
document.body.append(container);
createRoot(container).render(createElement(App));`;

const entryPlugin = (tsx: string, slugAndName: string): Plugin => ({
  name: 'k8o:demo-entry',
  // Vite の解決より先に、例の import を確かめる
  enforce: 'pre',
  resolveId(source, importer) {
    if (source === ENTRY_ID || source === APP_ID) {
      return `\0${source}`;
    }
    if (importer === `\0${APP_ID}` && !ALLOWED_IMPORT.test(source)) {
      this.error(
        `${slugAndName} の tsx は react と react-dom だけを import できる: ${source}`,
      );
    }
    return undefined;
  },
  load(id) {
    if (id === `\0${ENTRY_ID}`) {
      return { code: ENTRY, moduleType: 'js' };
    }
    if (id === `\0${APP_ID}`) {
      return { code: tsx, moduleType: 'tsx' };
    }
    return undefined;
  },
});

const isOutput = (value: unknown): value is Rolldown.RolldownOutput =>
  typeof value === 'object' && value !== null && 'output' in value;

// 例の文書は script を inline で持つので、束ねた JS の中の </script（React DOM が文字列で持つ）が
// 文書の script を閉じないように、JS として同じ意味の <\/script に書き換える
const escapeClosingScript = (code: string): string =>
  code.replaceAll(/<\/(script)/giu, String.raw`<\/$1`);

// tsx を、本番版の React ごと 1 本の ESM に束ねて minify する。例の iframe は origin を持たず、
// サイトの共有のファイルを module で読めないので、React も中に入れる
export const bundleDemoScript = async (
  demo: Pick<TsxDemo, 'tsx'> & { label: string },
  { root, target }: BundleOptions,
): Promise<string> => {
  const result = await build({
    configFile: false,
    envDir: false,
    publicDir: false,
    root,
    mode: 'production',
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    oxc: { jsx: { runtime: 'automatic' } },
    plugins: [entryPlugin(demo.tsx, demo.label)],
    build: {
      write: false,
      minify: true,
      target,
      modulePreload: false,
      copyPublicDir: false,
      reportCompressedSize: false,
      rolldownOptions: {
        input: ENTRY_ID,
        output: { format: 'es' },
      },
    },
  });
  const output = Array.isArray(result) ? result[0] : result;
  if (!isOutput(output) || output.output.length !== 1) {
    throw new Error(`${demo.label} の tsx を 1 本の JS に束ねられなかった`);
  }
  return escapeClosingScript(output.output[0].code);
};

const VIRTUAL_ID = 'virtual:blog-demo-scripts';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const ARTICLE_FILE = /\/content\/blog\/[^/]+\/article\.mdx$/u;

// 記事の tsx の例を束ねた JS を、route.ts が読む virtual:blog-demo-scripts にする。束ねた結果は
// tsx の中身ごとに覚え、dev で記事を保存したときは変わった例だけを束ね直す
export const blogDemoScripts = (
  readTsxDemos: () => Promise<TsxDemo[]>,
  options: BundleOptions,
): Plugin => {
  const bundles = new Map<string, Promise<string>>();
  const bundle = (demo: TsxDemo): Promise<string> => {
    const cached = bundles.get(demo.tsx);
    if (cached !== undefined) {
      return cached;
    }
    const bundled = bundleDemoScript(
      { tsx: demo.tsx, label: `/blog/${demo.slug} の demo="${demo.name}"` },
      options,
    );
    bundles.set(demo.tsx, bundled);
    return bundled;
  };

  return {
    name: 'k8o:blog-demo-scripts',
    resolveId(source) {
      return source === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) {
        return undefined;
      }
      const scripts = Object.fromEntries(
        await Promise.all(
          (await readTsxDemos()).map(
            async (demo) =>
              [`${demo.slug}/${demo.name}`, await bundle(demo)] as const,
          ),
        ),
      );
      return [
        `const scripts = ${JSON.stringify(scripts)};`,
        'export const findDemoScript = (slug, name) => scripts[slug + "/" + name];',
      ].join('\n');
    },
    hotUpdate({ file, modules }) {
      if (!ARTICLE_FILE.test(file)) {
        return undefined;
      }
      const scripts =
        this.environment.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
      return scripts === undefined ? undefined : [...modules, scripts];
    },
  };
};
