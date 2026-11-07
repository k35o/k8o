import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import remarkPreset from '@repo/mdx-preset/remark';
import type { Nodes, RootContent } from 'mdast';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { describe, expect, it } from 'vitest';

type OutlineItem =
  | { kind: 'section'; level: number; text: string }
  | { kind: 'playground'; level: number | undefined; text: string };

type MdxJsxFlowElement = Extract<RootContent, { type: 'mdxJsxFlowElement' }>;

const blogDir = join(cwd(), 'src/content/blog');

const slugs = readdirSync(blogDir).filter((name) => !name.startsWith('.'));

const parser = remark().use(remarkMdx).use(remarkPreset);

const plainText = (node: Nodes): string =>
  'value' in node
    ? node.value
    : 'children' in node
      ? node.children.map((child) => plainText(child)).join('')
      : '';

const stringAttribute = (
  node: MdxJsxFlowElement,
  name: string,
): string | undefined => {
  for (const attribute of node.attributes) {
    if (
      attribute.type === 'mdxJsxAttribute' &&
      attribute.name === name &&
      typeof attribute.value === 'string'
    ) {
      return attribute.value;
    }
  }
  return undefined;
};

const headingLevelNumber = (value: string | undefined): number | undefined => {
  const digit = value?.match(/^h([1-6])$/u)?.[1];
  return digit === undefined ? undefined : Number(digit);
};

const playgroundNames = new Set(['Playground', 'PlaygroundEmbed']);

// 記事の頭の題が h2 で、MDX の `#` は描かず、`##` から一段ずらして h3 で描く
const outlineItems = (node: Nodes): OutlineItem[] => {
  if (node.type === 'heading') {
    return node.depth === 1
      ? []
      : [{ kind: 'section', level: node.depth + 1, text: plainText(node) }];
  }
  if (
    node.type === 'mdxJsxFlowElement' &&
    node.name !== null &&
    playgroundNames.has(node.name)
  ) {
    return [
      {
        kind: 'playground',
        level: headingLevelNumber(stringAttribute(node, 'headingLevel')),
        text:
          stringAttribute(node, 'demo') ??
          stringAttribute(node, 'title') ??
          node.name,
      },
    ];
  }
  return 'children' in node
    ? node.children.flatMap((child) => outlineItems(child))
    : [];
};

const articleOutline = (slug: string): OutlineItem[] => [
  { kind: 'section', level: 2, text: '記事の題' },
  ...outlineItems(
    parser.parse(readFileSync(join(blogDir, slug, 'article.mdx'), 'utf8')),
  ),
];

const skippedHeadings = (outline: OutlineItem[]): string[] => {
  const leveled = outline.flatMap((item) =>
    item.level === undefined ? [] : [{ level: item.level, text: item.text }],
  );
  return leveled.flatMap((item, index) => {
    const previous = leveled[index - 1];
    return previous !== undefined && item.level > previous.level + 1
      ? [
          `h${String(previous.level)} の次の h${String(item.level)}「${item.text}」`,
        ]
      : [];
  });
};

const misplacedPlaygrounds = (outline: OutlineItem[]): string[] => {
  const misplaced: string[] = [];
  let sectionLevel = 0;
  for (const item of outline) {
    if (item.kind === 'section') {
      sectionLevel = item.level;
    } else if (item.level !== sectionLevel + 1) {
      misplaced.push(
        `「${item.text}」は h${String(sectionLevel + 1)}（今は ${item.level === undefined ? 'headingLevel が無い' : `h${String(item.level)}`}）`,
      );
    }
  }
  return misplaced;
};

describe('記事の見出しの並び', () => {
  describe('正常系', () => {
    it.each(slugs)('%s の見出しは段を飛ばさない', (slug) => {
      expect(skippedHeadings(articleOutline(slug))).toStrictEqual([]);
    });

    it.each(slugs)(
      '%s の Playground は、置いた節の見出しの一つ下の段で題を描く',
      (slug) => {
        expect(misplacedPlaygrounds(articleOutline(slug))).toStrictEqual([]);
      },
    );
  });
});
