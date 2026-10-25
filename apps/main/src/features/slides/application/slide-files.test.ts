import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import remarkPreset from '@repo/mdx-preset/remark';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { describe, expect, it } from 'vitest';

import { slidePath } from './path';

const slugs = readdirSync(join(cwd(), 'src/content/slides')).filter(
  (name) => !name.startsWith('.'),
);

const parser = remark().use(remarkMdx).use(remarkPreset);

// コードブロックの中の import 文は数えず、MDX の ESM の import だけを見る
const esmImportSources = (slug: string): string[] =>
  parser
    .parse(readFileSync(slidePath(slug), 'utf8'))
    .children.flatMap((node) =>
      node.type === 'mdxjsEsm' ? (node.data?.estree?.body ?? []) : [],
    )
    .flatMap((statement) =>
      statement.type === 'ImportDeclaration'
        ? [String(statement.source.value)]
        : [],
    );

const isNextOrAppAlias = (source: string): boolean =>
  source.startsWith('@/') ||
  source === 'next' ||
  source.startsWith('next/') ||
  source === 'next-themes';

describe('src/content/slides のスライド', () => {
  describe('正常系', () => {
    it('スライドがある', () => {
      expect(slugs.length).toBeGreaterThan(0);
    });

    it.each(slugs)('%s に content.mdx がある', (slug) => {
      expect(existsSync(slidePath(slug))).toBe(true);
    });

    it.each(slugs)(
      '%s の MDX は @/・next・next-themes を import しない（部品は components で受け取る）',
      (slug) => {
        expect(
          esmImportSources(slug).filter((source) => isNextOrAppAlias(source)),
        ).toStrictEqual([]);
      },
    );
  });
});
