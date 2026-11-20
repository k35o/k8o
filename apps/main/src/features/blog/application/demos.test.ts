import { describe, expect, it } from 'vitest';

import { readDemos } from './demos';

const fence = (lang: string, meta: string, code: string): string =>
  `\`\`\`${lang} ${meta}\n${code}\n\`\`\``;

const article = (...blocks: string[]): string =>
  ['---', 'title: 記事', '---', '', ...blocks].join('\n\n');

describe('readDemos', () => {
  describe('正常系', () => {
    it('demo の名前ごとに、HTML・CSS・JS のコードを集める', () => {
      const source = article(
        '本文',
        fence('html', 'demo="dots"', '<ul class="dots"></ul>'),
        fence('css', 'demo="dots"', '.dots { display: flex; }'),
        fence('js', 'demo="dots"', 'console.log(1);'),
      );

      expect(readDemos(source)).toStrictEqual([
        {
          name: 'dots',
          html: '<ul class="dots"></ul>',
          css: '.dots { display: flex; }',
          js: 'console.log(1);',
          tsx: '',
        },
      ]);
    });

    it('React の部品を書いた tsx も集める', () => {
      const source = article(
        fence('tsx', 'demo="counter"', 'export default function App() {}'),
      );

      expect(readDemos(source)[0]?.tsx).toBe(
        'export default function App() {}',
      );
    });

    it('注釈の行は、記事に出ないので動かすコードからも外す', () => {
      const source = article(
        fence(
          'css',
          'demo="dots"',
          ['.dots {', '  /* [!hl] */', '  display: flex;', '}'].join('\n'),
        ),
      );

      expect(readDemos(source)[0]?.css).toBe('.dots {\n  display: flex;\n}');
    });

    it('本文を挟めば、別の名前の例を並べられる', () => {
      const source = article(
        fence('html', 'demo="first"', '<p>1</p>'),
        '本文',
        fence('html', 'demo="second"', '<p>2</p>'),
      );

      expect(readDemos(source).map(({ name }) => name)).toStrictEqual([
        'first',
        'second',
      ]);
    });

    it('同じ言語のブロックが続けば、順につなぐ', () => {
      const source = article(
        fence('css', 'demo="dots"', '.a {}'),
        fence('css', 'demo="dots"', '.b {}'),
      );

      expect(readDemos(source)[0]?.css).toBe('.a {}\n.b {}');
    });
  });

  describe('異常系', () => {
    it('同じ名前のブロックが離れていると投げる', () => {
      const source = article(
        fence('html', 'demo="dots"', '<p></p>'),
        '本文',
        fence('css', 'demo="dots"', 'p {}'),
      );

      expect(() => readDemos(source)).toThrow(/demo="dots"/u);
    });

    it('js と tsx を同じ例に書くと投げる', () => {
      const source = article(
        fence('js', 'demo="dots"', 'console.log(1);'),
        fence('tsx', 'demo="dots"', 'export default function App() {}'),
      );

      expect(() => readDemos(source)).toThrow(/js と tsx/u);
    });

    it('決めた権限のほかを allow に書くと投げる', () => {
      const source = article(
        fence('js', 'demo="cam" allow="camera"', 'console.log(1);'),
      );

      expect(() => readDemos(source)).toThrow(/allow="camera"/u);
    });

    it('HTML・CSS・JS・tsx 以外の言語は投げる', () => {
      const source = article(fence('ts', 'demo="dots"', 'const a = 1;'));

      expect(() => readDemos(source)).toThrow(/ts/u);
    });
  });

  describe('エッジケース', () => {
    it('demo を書いていないコードブロックは集めない', () => {
      const source = article(fence('css', 'title="a.css"', 'p {}'));

      expect(readDemos(source)).toStrictEqual([]);
    });
  });
});
