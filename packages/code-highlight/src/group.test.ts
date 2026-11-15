import type { Element, Nodes, Root, Text } from 'hast';
import { describe, expect, it } from 'vitest';

import { DEMO_TAG } from './demo.ts';
import { GROUP_TAG, groupAdjacentCodeBlocks } from './group.ts';

const text = (value: string): Text => ({ type: 'text', value });
const rootOf = (children: Nodes[]): Root => ({
  type: 'root',
  children: children as Root['children'],
});
const codeBlock = (label: string, demo?: string): Element => ({
  type: 'element',
  tagName: 'div',
  properties: {
    class: 'code-annotate-block',
    'data-label': label,
    ...(demo === undefined ? {} : { 'data-demo': demo }),
  },
  children: [],
});
const paragraph = (): Element => ({
  type: 'element',
  tagName: 'p',
  properties: {},
  children: [text('本文')],
});
const outline = (tree: Root): string[] =>
  tree.children.map((c) => (c.type === 'element' ? c.tagName : c.type));
const labelsOf = (group: Nodes | undefined): unknown[] =>
  (group as Element).children.map(
    (c) => (c as Element).properties['data-label'],
  );

describe.each([
  {
    shape: '素の要素',
    make: (label: string, demo?: string): Nodes => codeBlock(label, demo),
  },
  {
    // @shikijs/rehype が実際に出力する形
    shape: 'root フラグメントで包まれた要素',
    make: (label: string, demo?: string): Nodes =>
      rootOf([text('\n'), codeBlock(label, demo), text('\n')]),
  },
])('groupAdjacentCodeBlocks（$shape）', ({ make }) => {
  describe('正常系', () => {
    it('空白だけを挟んで隣り合うコードブロックを1つのグループにまとめる', () => {
      const tree = rootOf([make('a.ts'), text('\n'), make('b.ts'), text('\n')]);

      groupAdjacentCodeBlocks(tree);

      expect(outline(tree)).toStrictEqual([GROUP_TAG, 'text']);
      expect(labelsOf(tree.children[0])).toStrictEqual(['a.ts', 'b.ts']);
    });

    it('本文を挟んだコードブロックはまとめない', () => {
      const tree = rootOf([
        make('a.ts'),
        text('\n'),
        paragraph(),
        text('\n'),
        make('b.ts'),
      ]);

      groupAdjacentCodeBlocks(tree);

      expect(outline(tree)).toStrictEqual(['div', 'text', 'p', 'text', 'div']);
    });

    it('入れ子の要素の中でもまとめる', () => {
      const li: Element = {
        type: 'element',
        tagName: 'li',
        properties: {},
        children: [make('a.ts'), make('b.ts')] as Element['children'],
      };
      const tree = rootOf([li]);

      groupAdjacentCodeBlocks(tree);

      expect(li.children).toHaveLength(1);
      expect(labelsOf(li.children[0])).toStrictEqual(['a.ts', 'b.ts']);
    });

    it('同じ demo の名前のコードブロックを、名前を持つ code-demo で包んだグループにする', () => {
      const tree = rootOf([
        make('html', 'dots'),
        text('\n'),
        make('css', 'dots'),
        text('\n'),
      ]);

      groupAdjacentCodeBlocks(tree);

      expect(outline(tree)).toStrictEqual([DEMO_TAG, 'text']);
      const demo = tree.children[0] as Element;
      expect(demo).toMatchObject({
        properties: { name: 'dots' },
        children: [{ tagName: GROUP_TAG }],
      });
      expect(labelsOf(demo.children[0])).toStrictEqual(['html', 'css']);
    });

    it('demo の名前が替わるところでグループを分ける', () => {
      const tree = rootOf([
        make('a.ts'),
        make('html', 'first'),
        make('css', 'first'),
        make('html', 'second'),
        make('b.ts'),
      ]);

      groupAdjacentCodeBlocks(tree);

      expect(outline(tree)).toStrictEqual(['div', DEMO_TAG, DEMO_TAG, 'div']);
      expect(tree.children).toMatchObject([
        {},
        { properties: { name: 'first' } },
        { properties: { name: 'second' } },
        {},
      ]);
    });
  });

  describe('エッジケース', () => {
    it('1つだけのコードブロックはグループにしない', () => {
      const tree = rootOf([paragraph(), make('a.ts'), paragraph()]);

      groupAdjacentCodeBlocks(tree);

      expect(outline(tree)).toStrictEqual(['p', 'div', 'p']);
    });

    it('1つだけの demo のコードブロックは、グループにせずに code-demo で包む', () => {
      const tree = rootOf([paragraph(), make('html', 'dots'), paragraph()]);

      groupAdjacentCodeBlocks(tree);

      expect(outline(tree)).toStrictEqual(['p', DEMO_TAG, 'p']);
      const demo = tree.children[1] as Element;
      expect(demo.children.map((c) => (c as Element).tagName)).toStrictEqual([
        'div',
      ]);
    });

    it('3つ以上でも1つのグループにまとめる', () => {
      const tree = rootOf([make('a'), make('b'), make('c')]);

      groupAdjacentCodeBlocks(tree);

      expect(outline(tree)).toStrictEqual([GROUP_TAG]);
      expect(labelsOf(tree.children[0])).toStrictEqual(['a', 'b', 'c']);
    });
  });
});
