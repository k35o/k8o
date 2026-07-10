import { lintSource } from './lint-source';

// oxlint の実バイナリを子プロセスで起動する統合テスト
describe('lintSource', () => {
  describe('正常系', () => {
    it('no-var違反をルールコード・位置つきで検出する', async () => {
      const diagnostics = await lintSource('var x = 1;\n', 'ts');

      const noVar = diagnostics.find((d) => d.code === 'eslint(no-var)');
      expect(noVar).toBeDefined();
      expect(noVar?.severity).toBe('error');
      expect(noVar?.line).toBe(1);
    });

    it('問題のないコードでは空配列を返す', async () => {
      const diagnostics = await lintSource('export const answer = 42;\n', 'ts');

      expect(diagnostics).toEqual([]);
    });

    it('tsxではJSXを解釈できる', async () => {
      const diagnostics = await lintSource(
        'export const App = () => <output>ok</output>;\n',
        'tsx',
      );

      expect(diagnostics).toEqual([]);
    });

    it('no-consoleはwarningとして返る', async () => {
      const diagnostics = await lintSource("console.log('hi');\n", 'ts');

      const noConsole = diagnostics.find(
        (d) => d.code === 'eslint(no-console)',
      );
      expect(noConsole?.severity).toBe('warning');
    });
  });

  describe('異常系', () => {
    it('構文エラーも診断として返す', async () => {
      const diagnostics = await lintSource('const = ;\n', 'ts');

      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]?.severity).toBe('error');
    });
  });

  describe('エッジケース', () => {
    it('未使用のdisableディレクティブはコード無しの診断として返る', async () => {
      const diagnostics = await lintSource(
        '// oxlint-disable-next-line no-var\nexport const a = 1;\n',
        'ts',
      );

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]?.code).toBeNull();
      expect(diagnostics[0]?.message).toContain('Unused');
    });

    it('空文字はno-empty-fileの診断になる', async () => {
      const diagnostics = await lintSource('', 'ts');

      expect(diagnostics.map((d) => d.code)).toEqual([
        'unicorn(no-empty-file)',
      ]);
    });
  });
});
