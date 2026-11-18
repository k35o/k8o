import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { describe, expect, it } from 'vitest';

import {
  esmImportSources,
  mdxParser,
  stringAttribute,
} from '@/shared/mdx/mdx-tree';

import { deckMdxPath } from './path';

const decksDir = join(cwd(), 'src/content/talks');

const slugs = existsSync(decksDir)
  ? readdirSync(decksDir).filter((name) => !name.startsWith('.'))
  : [];

const parse = (slug: string) =>
  mdxParser.parse(readFileSync(deckMdxPath(slug), 'utf8'));

const deckShellSlugs = (slug: string): string[] =>
  parse(slug).children.flatMap((node) => {
    if (node.type !== 'mdxJsxFlowElement' || node.name !== 'SlideDeckShell') {
      return [];
    }
    const value = stringAttribute(node, 'slug');
    return value === undefined ? [] : [value];
  });

// MDX のデッキが 1 本も無いあいだは、確かめる相手が無い
describe.skipIf(slugs.length === 0)('src/content/talks のデッキ', () => {
  describe('正常系', () => {
    it.each(slugs)('%s に content.mdx がある', (slug) => {
      expect(existsSync(deckMdxPath(slug))).toBe(true);
    });

    it.each(slugs)(
      '%s の MDX は @/ を import しない（部品は components で受け取る）',
      (slug) => {
        expect(
          esmImportSources(parse(slug)).filter((source) =>
            source.startsWith('@/'),
          ),
        ).toStrictEqual([]);
      },
    );

    it.each(slugs)(
      '%s の SlideDeckShell の slug はディレクトリ名と同じ（QR の URL と発表者モードの同期の名前になる）',
      (slug) => {
        expect(deckShellSlugs(slug)).toStrictEqual([slug]);
      },
    );
  });
});
