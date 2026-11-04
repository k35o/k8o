import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';

import rehypeCodeHighlight from './index.ts';

const codeBlock = (lang: string, code: string): Root => ({
  type: 'root',
  children: [
    {
      type: 'element',
      tagName: 'pre',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'code',
          properties: { className: [`language-${lang}`] },
          children: [{ type: 'text', value: code }],
        },
      ],
    },
  ],
});

const highlight = async (tree: Root): Promise<void> => {
  // このプラグインは unified の processor・options・VFile を読まないので、空の値で呼ぶ
  const transform = rehypeCodeHighlight.call(
    {} as ThisParameterType<typeof rehypeCodeHighlight>,
    {} as Parameters<typeof rehypeCodeHighlight>[0],
  );
  if (typeof transform !== 'function') {
    throw new TypeError('rehype のプラグインが変換の関数を返さない');
  }
  await transform(tree, {} as Parameters<typeof transform>[1], () => {});
};

const spansOf = (node: Root | Element, text: string): Element[] =>
  node.children.flatMap((child) => {
    if (child.type !== 'element') return [];
    const [only, ...rest] = child.children;
    const own =
      child.tagName === 'span' &&
      rest.length === 0 &&
      only?.type === 'text' &&
      only.value === text
        ? [child]
        : [];
    return [...own, ...spansOf(child, text)];
  });

const colorsOf = (span: Element): Record<string, string> =>
  Object.fromEntries(
    String(span.properties.style)
      .split(';')
      .map((declaration) => declaration.split(':'))
      .filter(([name]) => name === 'color' || name === '--shiki-dark'),
  );

describe('rehypeCodeHighlight', () => {
  describe('正常系', () => {
    // @shikijs/rehype は最初の変換で同梱の全言語を読み込むので、既定の 5 秒では足りない
    it(
      'コメントは light・dark ともに 4.5:1 に届く色に差し替えて出す',
      { timeout: 60_000 },
      async () => {
        const tree = codeBlock('ts', '// note');

        await highlight(tree);

        expect(spansOf(tree, '// note').map(colorsOf)).toStrictEqual([
          { color: '#5a5a60', '--shiki-dark': '#939aa7' },
        ]);
      },
    );
  });
});
