import { highlightCode } from './tokenize-client.ts';

const distinctColors = (
  tokens: Awaited<ReturnType<typeof highlightCode>>['tokens'],
): Set<string | undefined> =>
  new Set(tokens.flat().map((token) => token.color));

const blocked = () => {
  throw new Error('WebAssembly violates Content Security Policy directive');
};

describe('highlightCode (client)', () => {
  describe('正常系', () => {
    it.each(['ts', 'tsx', 'js', 'jsx'])(
      '%s のコードが複数色のトークンにハイライトされる',
      async (lang) => {
        const result = await highlightCode(
          'const greeting = "hello";\nexport const App = () => <p>{greeting}</p>;',
          lang,
        );

        expect(distinctColors(result.tokens).size).toBeGreaterThan(1);
      },
    );

    it('テーマごとに前景・背景色が切り替わる', async () => {
      const dark = await highlightCode('const a = 1;', 'ts', 'plastic');
      const light = await highlightCode('const a = 1;', 'ts', 'one-light');

      expect(dark.bg).not.toBe(light.bg);
      expect(dark.fg).not.toBe(light.fg);
    });
  });

  describe('異常系', () => {
    it('未対応の言語は無色 (text) にフォールバックする', async () => {
      const result = await highlightCode('SELECT * FROM users;', 'sql');

      expect(distinctColors(result.tokens).size).toBe(1);
    });
  });

  describe('エッジケース', () => {
    it('WebAssembly が使えない環境 (CSP で wasm がブロックされた本番ブラウザ相当) でも動く', async () => {
      vi.stubGlobal('WebAssembly', {
        Module: blocked,
        compile: blocked,
        instantiate: blocked,
      });
      // ハイライターは module singleton のため、初期化からブロック下で走らせる
      vi.resetModules();
      try {
        const { highlightCode: freshHighlightCode } =
          await import('./tokenize-client.ts');
        const result = await freshHighlightCode('const a: number = 1;', 'ts');

        expect(distinctColors(result.tokens).size).toBeGreaterThan(1);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});
