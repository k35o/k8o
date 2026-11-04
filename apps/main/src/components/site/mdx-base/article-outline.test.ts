import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import remarkPreset from '@repo/mdx-preset/remark';
import type { Nodes } from 'mdast';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { describe, expect, it } from 'vitest';

type OutlineItem = { level: number; text: string };

const blogDir = join(cwd(), 'src/content/blog');

const slugs = readdirSync(blogDir).filter((name) => !name.startsWith('.'));

const parser = remark().use(remarkMdx).use(remarkPreset);

const plainText = (node: Nodes): string =>
  'value' in node
    ? node.value
    : 'children' in node
      ? node.children.map((child) => plainText(child)).join('')
      : '';

// 記事の頭の題が h2 で、MDX の `#` は描かず、`##` から一段ずらして h3 で描く
const outlineItems = (node: Nodes): OutlineItem[] => {
  if (node.type === 'heading') {
    return node.depth === 1
      ? []
      : [{ level: node.depth + 1, text: plainText(node) }];
  }
  return 'children' in node
    ? node.children.flatMap((child) => outlineItems(child))
    : [];
};

const articleOutline = (slug: string): OutlineItem[] => [
  { level: 2, text: '記事の題' },
  ...outlineItems(
    parser.parse(readFileSync(join(blogDir, slug, 'article.mdx'), 'utf8')),
  ),
];

const skippedHeadings = (outline: OutlineItem[]): string[] =>
  outline.flatMap((item, index) => {
    const previous = outline[index - 1];
    return previous !== undefined && item.level > previous.level + 1
      ? [
          `h${String(previous.level)} の次の h${String(item.level)}「${item.text}」`,
        ]
      : [];
  });

describe('記事の見出しの並び', () => {
  describe('正常系', () => {
    it.each(slugs)('%s の見出しは段を飛ばさない', (slug) => {
      expect(skippedHeadings(articleOutline(slug))).toStrictEqual([]);
    });
  });
});
