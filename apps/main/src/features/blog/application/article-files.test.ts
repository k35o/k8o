import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import remarkPreset from '@repo/mdx-preset/remark';
import type { Nodes } from 'mdast';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { describe, expect, it } from 'vitest';

import { collectLinkCardHrefs } from './link-card-urls';
import { blogPath } from './path';

// macOS の .DS_Store のような隠しファイルだけを外す。直下に置いた foo.mdx のような誤りは、
// slug として blogPath に渡して落とす
const slugs = readdirSync(join(cwd(), 'src/content/blog')).filter(
  (name) => !name.startsWith('.'),
);

const parser = remark().use(remarkMdx).use(remarkPreset);

const parse = (slug: string) =>
  parser.parse(readFileSync(blogPath(slug), 'utf8'));

// コードブロックの中の import 文は数えず、MDX の ESM の import だけを見る
const esmImportSources = (slug: string): string[] =>
  parse(slug)
    .children.flatMap((node) =>
      node.type === 'mdxjsEsm' ? (node.data?.estree?.body ?? []) : [],
    )
    .flatMap((statement) =>
      statement.type === 'ImportDeclaration'
        ? [String(statement.source.value)]
        : [],
    );

const hasMath = (node: Nodes): boolean =>
  node.type === 'inlineMath' ||
  node.type === 'math' ||
  (node.type === 'code' && node.lang === 'math') ||
  ('children' in node && node.children.some((child) => hasMath(child)));

const mathSlugs = slugs.filter((slug) => hasMath(parse(slug)));

const linkCardMetadataHrefs = new Set(
  Object.keys(
    JSON.parse(
      readFileSync(join(cwd(), 'src/content/link-card-metadata.json'), 'utf8'),
    ),
  ),
);

describe('src/content/blog の記事', () => {
  describe('正常系', () => {
    it('記事がある', () => {
      expect(slugs.length).toBeGreaterThan(0);
    });

    it.each(slugs)('%s に article.mdx がある', (slug) => {
      expect(existsSync(blogPath(slug))).toBe(true);
    });

    it.each(slugs)('%s の MDX は @/app/ を import しない', (slug) => {
      expect(
        esmImportSources(slug).filter((source) => source.startsWith('@/app/')),
      ).toStrictEqual([]);
    });

    it.each(mathSlugs)(
      '%s は数式を使うので @repo/mdx-preset/katex.css を import する',
      (slug) => {
        expect(esmImportSources(slug)).toContain('@repo/mdx-preset/katex.css');
      },
    );

    it.each(slugs)(
      '%s の LinkCard の href は、すべて src/content/link-card-metadata.json にある（無ければ generate:link-card-metadata を流す）',
      (slug) => {
        expect(
          collectLinkCardHrefs(readFileSync(blogPath(slug), 'utf8')).filter(
            (href) => !linkCardMetadataHrefs.has(href),
          ),
        ).toStrictEqual([]);
      },
    );
  });
});
