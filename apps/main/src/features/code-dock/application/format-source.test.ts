import { formatSource } from './format-source';

// oxfmt の NAPI バインディングを直接呼ぶ統合テスト
describe('formatSource', () => {
  describe('正常系', () => {
    it('ダブルクォートをシングルクォートへ整形する', async () => {
      const result = await formatSource('const a = "b"\n', 'ts');

      expect(result).toEqual({ code: "const a = 'b';\n", ok: true });
    });

    it('import宣言をモジュール名でソートする', async () => {
      const result = await formatSource(
        [
          "import { z } from 'zebra';",
          "import { a } from 'alpha';",
          'export const x = [z, a];',
          '',
        ].join('\n'),
        'ts',
      );

      expect(result).toEqual({
        code: [
          "import { a } from 'alpha';",
          "import { z } from 'zebra';",
          'export const x = [z, a];',
          '',
        ].join('\n'),
        ok: true,
      });
    });

    it('tsxのJSXを整形できる', async () => {
      const result = await formatSource(
        'export const App = () => <output>ok</output>\n',
        'tsx',
      );

      expect(result).toEqual({
        code: 'export const App = () => <output>ok</output>;\n',
        ok: true,
      });
    });
  });

  describe('異常系', () => {
    it('構文エラーではメッセージを返す', async () => {
      const result = await formatSource('const = ;\n', 'ts');

      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('message');
    });
  });
});
