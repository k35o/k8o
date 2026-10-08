import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const fixturesDir = resolve(import.meta.dirname, 'fixtures');

// vite-plus が同梱する oxlint 本体を、vite-plus/bin/oxlint と同じ手順で解決する
const resolveOxlintBin = (): string => {
  const requireHere = createRequire(import.meta.url);
  const vitePlusDir = dirname(requireHere.resolve('vite-plus/package.json'));
  const requireFromVitePlus = createRequire(join(vitePlusDir, 'package.json'));
  const oxlintMain = requireFromVitePlus.resolve('oxlint');
  return join(dirname(dirname(oxlintMain)), 'bin', 'oxlint');
};

const runOxlint = (): string => {
  try {
    return execFileSync(
      process.execPath,
      [resolveOxlintBin(), '-c', 'oxlint.config.ts', '--format', 'json', '.'],
      {
        cwd: fixturesDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
  } catch (error) {
    // oxlint は違反があると非0で終了するが、診断JSONはstdoutに出ている
    if (
      typeof error === 'object' &&
      error !== null &&
      'stdout' in error &&
      typeof error.stdout === 'string'
    ) {
      return error.stdout;
    }
    throw error;
  }
};

type Diagnostic = {
  message: string;
  code: string;
  filename: string;
};

const lintFixtures = (): Diagnostic[] => {
  const { diagnostics } = JSON.parse(runOxlint()) as {
    diagnostics: Diagnostic[];
  };
  return diagnostics;
};

const diagnostics = lintFixtures();

const diagnosticsFor = (filename: string, code: string): Diagnostic[] =>
  diagnostics.filter(
    (diagnostic) =>
      diagnostic.filename === filename && diagnostic.code === code,
  );

const BOUNDARY = 'k8o(database-import-boundary)';

describe('k8o oxlint plugin (oxlint 実行での統合テスト)', () => {
  describe('正常系', () => {
    test('許可された層には診断が出ない', () => {
      const cleanFiles = [
        'apps/ai/src/features/demo/infrastructure/demo-repository.ts',
        'apps/main/src/features/demo/application/demo.ts',
      ];
      for (const file of cleanFiles) {
        expect(
          diagnostics.filter((diagnostic) => diagnostic.filename === file),
        ).toStrictEqual([]);
      }
    });

    test('診断は想定した違反だけに限られる', () => {
      const found = diagnostics
        .map((diagnostic) => `${diagnostic.filename} ${diagnostic.code}`)
        .toSorted();
      expect(found).toStrictEqual(
        [
          `apps/main/src/app/page.tsx ${BOUNDARY}`,
          `apps/ai/src/features/demo/interface/bad-import.ts ${BOUNDARY}`,
          `apps/ai/src/shared/auth/session.ts ${BOUNDARY}`,
        ].toSorted(),
      );
    });
  });

  describe('異常系', () => {
    test('app/ からの import を検出する', () => {
      expect(
        diagnosticsFor('apps/main/src/app/page.tsx', BOUNDARY),
      ).toHaveLength(1);
    });

    test('interface からの型だけの import も検出する', () => {
      expect(
        diagnosticsFor(
          'apps/ai/src/features/demo/interface/bad-import.ts',
          BOUNDARY,
        ),
      ).toHaveLength(1);
    });

    test('shared/auth では auth 以外のサブパスを検出する', () => {
      const found = diagnosticsFor(
        'apps/ai/src/shared/auth/session.ts',
        BOUNDARY,
      );
      expect(found).toHaveLength(1);
      expect(found[0]?.message).toContain("'@repo/database/auth' だけ");
    });
  });
});
