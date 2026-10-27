import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Plugin } from 'vite';

import type { BlogArticle } from './paths.ts';

const KATEX_CSS = '@repo/mdx-preset/katex.css';

const STYLESHEET = /<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="([^"]+)"/gu;

const loadsKatexCss = async (
  staticDir: string,
  slug: string,
): Promise<boolean> => {
  const html = await readFile(
    join(staticDir, 'blog', slug, 'index.html'),
    'utf8',
  );
  const styles = await Promise.all(
    [...html.matchAll(STYLESHEET)].map(([, href = '']) =>
      readFile(join(staticDir, href), 'utf8'),
    ),
  );
  return styles.some((css) => css.includes('.katex'));
};

// 記事の MDX が import する CSS は、plugin-rsc の README に無い query（blog-article の glob の
// ?vite-rsc-css-export=default）でだけ HTML に載る。依存の更新で効かなくなったら、ここでビルドを止める
export const katexCssGuard = (
  pages: () => Promise<readonly BlogArticle[]>,
): Plugin => ({
  name: 'k8o:katex-css-guard',
  apply: 'build',
  buildApp: {
    order: 'post',
    async handler(builder) {
      const staticDir = join(
        builder.config.root,
        '.vercel',
        'output',
        'static',
      );
      const slugs = (await pages())
        .filter(({ mdx }) => mdx.includes(KATEX_CSS))
        .map(({ slug }) => slug);
      const missing = (
        await Promise.all(
          slugs.map(async (slug) =>
            (await loadsKatexCss(staticDir, slug)) ? [] : [slug],
          ),
        )
      ).flat();
      if (missing.length > 0) {
        throw new Error(
          `${KATEX_CSS} を import する記事の HTML に KaTeX の CSS が載っていない: ${missing.join(', ')}`,
        );
      }
    },
  },
});
