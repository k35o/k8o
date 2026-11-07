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

const tagNamesOf = (tree: Root): string[] => {
  const tagNames: string[] = [];
  visit(tree, 'element', (node) => {
    tagNames.push(node.tagName);
  });
  return tagNames;
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
    it('インラインの数式を KaTeX の HTML に置き換える', () => {
      const { tree, messages } = run([
        element('p', [], [text('式 '), inlineMath('x^2'), text(' を描く')]),
      ]);

      const classNames = classNamesOf(tree);
      expect(classNames).toContain('katex');
      expect(classNames).toContain('katex-base');
      expect(classNames).not.toContain('katex-display');
      expect(classNames).not.toContain('language-math');
      expect(tagNamesOf(tree)).not.toContain('code');
      expect(messages).toStrictEqual([]);
    });

    it('前後のテキストを残したまま置き換える', () => {
      const { tree } = run([
        element('p', [], [text('式 '), inlineMath('x^2'), text(' を描く')]),
      ]);

      expect(tree.children).toMatchObject([
        {
          tagName: 'p',
          children: [
            text('式 '),
            { tagName: 'span', properties: { className: ['katex'] } },
            text(' を描く'),
          ],
        },
      ]);
    });

    it('ブロックの数式は pre ごと display モードの HTML に置き換える', () => {
      const { tree } = run([
        element(
          'pre',
          [],
          [
            element(
              'code',
              ['language-math', 'math-display'],
              [text(String.raw`\frac{a}{b}`)],
            ),
          ],
        ),
      ]);

      expect(classNamesOf(tree)).toContain('katex-display');
      expect(classNamesOf(tree)).toContain('mfrac');
      expect(tagNamesOf(tree)).not.toContain('pre');
    });

    it('ブロックの数式は、横にスクロールしてもキーボードで届くよう Tab で止まれる箱にする', () => {
      const { tree } = run([
        element(
          'pre',
          [],
          [element('code', ['language-math', 'math-display'], [text('a + b')])],
        ),
      ]);

      expect(tree.children).toMatchObject([
        {
          tagName: 'span',
          properties: { className: ['katex-display'], tabIndex: 0 },
        },
      ]);
      expect(tabIndexesOf(tree)).toStrictEqual([0]);
    });

    it('```math のコードブロックも display モードで描く', () => {
      const { tree } = run([
        element(
          'pre',
          [],
          [element('code', ['language-math'], [text('a + b')])],
        ),
      ]);

      expect(classNamesOf(tree)).toContain('katex-display');
      expect(tagNamesOf(tree)).not.toContain('pre');
    });
  });

  describe('異常系', () => {
    it('構文が誤っている数式は警告を出し、KaTeX のエラー表示で描く', () => {
      const { tree, messages } = run([inlineMath(String.raw`\frac{a}`)]);

      expect(messages).toStrictEqual(['KaTeX で数式を描画できない']);
      expect(classNamesOf(tree)).toContain('katex-error');
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
