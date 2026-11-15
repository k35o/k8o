import type { Element, ElementContent, Root } from 'hast';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';

import rehypeMath from './rehype-math.ts';

const text = (value: string): ElementContent => ({ type: 'text', value });

const element = (
  tagName: string,
  className: string[],
  children: ElementContent[],
): Element => ({
  type: 'element',
  tagName,
  properties: className.length > 0 ? { className } : {},
  children,
});

const inlineMath = (value: string): Element =>
  element('code', ['language-math', 'math-inline'], [text(value)]);

const displayMath = (value: string): Element =>
  element(
    'pre',
    [],
    [element('code', ['language-math', 'math-display'], [text(value)])],
  );

const run = (
  children: ElementContent[],
): { tree: Root; messages: string[] } => {
  const tree: Root = { type: 'root', children };
  const messages: string[] = [];
  rehypeMath()(tree, {
    message: (reason) => messages.push(reason),
  });
  return { tree, messages };
};

const elementsOf = (tree: Root, tagName: string): Element[] => {
  const elements: Element[] = [];
  visit(tree, 'element', (node) => {
    if (node.tagName === tagName) {
      elements.push(node);
    }
  });
  return elements;
};

const classNamesOf = (tree: Root): string[] => {
  const classNames: string[] = [];
  visit(tree, 'element', (node) => {
    const { className } = node.properties;
    if (Array.isArray(className)) {
      classNames.push(...className.map(String));
    }
  });
  return classNames;
};

const tabIndexesOf = (tree: Root): unknown[] => {
  const tabIndexes: unknown[] = [];
  visit(tree, 'element', (node) => {
    if (node.properties.tabIndex !== undefined) {
      tabIndexes.push(node.properties.tabIndex);
    }
  });
  return tabIndexes;
};

describe('rehypeMath', () => {
  describe('正常系', () => {
    it('インラインの数式を、前後のテキストを残したまま MathML の math 要素に置き換える', () => {
      const { tree, messages } = run([
        element('p', [], [text('式 '), inlineMath('x^2'), text(' を描く')]),
      ]);

      expect(tree.children).toMatchObject([
        {
          tagName: 'p',
          children: [
            text('式 '),
            {
              tagName: 'math',
              children: [
                {
                  tagName: 'msup',
                  children: [{ tagName: 'mi' }, { tagName: 'mn' }],
                },
              ],
            },
            text(' を描く'),
          ],
        },
      ]);
      expect(elementsOf(tree, 'code')).toStrictEqual([]);
      expect(messages).toStrictEqual([]);
    });

    it('インラインの数式は display を block にしない', () => {
      const { tree } = run([element('p', [], [inlineMath('x^2')])]);

      expect(elementsOf(tree, 'math')[0]?.properties).not.toHaveProperty(
        'display',
      );
    });

    it('ブロックの数式は pre ごと、display が block の math 要素に置き換える', () => {
      const { tree } = run([displayMath(String.raw`\frac{a}{b}`)]);

      expect(elementsOf(tree, 'pre')).toStrictEqual([]);
      expect(elementsOf(tree, 'math')).toMatchObject([
        { properties: { display: 'block' } },
      ]);
      expect(elementsOf(tree, 'mfrac')).toHaveLength(1);
    });

    it('ブロックの数式は、横にスクロールしてもキーボードで届くよう Tab で止まれる箱で包む', () => {
      const { tree } = run([displayMath('a + b')]);

      expect(tree.children).toMatchObject([
        {
          tagName: 'div',
          properties: { className: ['math-scroll'], tabIndex: 0 },
          children: [{ tagName: 'math' }],
        },
      ]);
      expect(tabIndexesOf(tree)).toStrictEqual([0]);
    });

    it('```math のコードブロックもブロックの数式として描く', () => {
      const { tree } = run([
        element(
          'pre',
          [],
          [element('code', ['language-math'], [text('a + b')])],
        ),
      ]);

      expect(elementsOf(tree, 'pre')).toStrictEqual([]);
      expect(elementsOf(tree, 'math')).toMatchObject([
        { properties: { display: 'block' } },
      ]);
    });

    it('\\mathbb の文字は、mathvariant を読まないブラウザでも出るよう Unicode の文字で書く', () => {
      const { tree } = run([inlineMath(String.raw`\mathbb{N}`)]);

      expect(elementsOf(tree, 'mi')).toMatchObject([{ children: [text('ℕ')] }]);
    });

    it('cases の列の左揃えを、columnalign を読まないブラウザでも効く class で書く', () => {
      const { tree } = run([
        displayMath(String.raw`\begin{cases} a & b \\ c & d \end{cases}`),
      ]);

      expect(classNamesOf(tree)).toContain('tml-left');
    });
  });

  describe('異常系', () => {
    it('構文が誤っている数式は警告を出し、Temml のエラー表示で描く', () => {
      const { tree, messages } = run([inlineMath(String.raw`\frac{a}`)]);

      expect(messages).toStrictEqual(['Temml で数式を描画できない']);
      expect(classNamesOf(tree)).toContain('temml-error');
    });
  });

  describe('エッジケース', () => {
    it('language-math でないコードはそのまま残す', () => {
      const code = element('code', ['language-ts'], [text('const x = 1;')]);
      const { tree } = run([element('pre', [], [code])]);

      expect(tree.children).toStrictEqual([element('pre', [], [code])]);
    });

    it('インラインの数式は文の中で折り返すので、Tab の順に入れない', () => {
      const { tree } = run([element('p', [], [inlineMath('x^2')])]);

      expect(tabIndexesOf(tree)).toStrictEqual([]);
    });
  });
});
