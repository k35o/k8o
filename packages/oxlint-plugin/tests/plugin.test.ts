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
const VERIFY_SESSION = 'k8o(require-verify-session)';

describe('k8o oxlint plugin (oxlint 実行での統合テスト)', () => {
  describe('正常系', () => {
    test('許可された層と対象外ファイルには診断が出ない', () => {
      const cleanFiles = [
        'apps/admin/src/features/demo/infrastructure/demo-repository.ts',
        'apps/main/src/features/demo/application/demo.ts',
        // 'use server' が無い interface ファイルは require-verify-session の対象外
        'apps/admin/src/features/demo/interface/queries.ts',
        // require-verify-session は admin だけが対象
        'apps/main/src/features/demo/interface/actions.ts',
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
          `apps/admin/src/features/demo/interface/bad-import.ts ${BOUNDARY}`,
          `apps/admin/src/shared/auth/session.ts ${BOUNDARY}`,
          `apps/admin/src/features/demo/interface/actions.ts ${VERIFY_SESSION}`,
          `apps/admin/src/features/demo/interface/actions.ts ${VERIFY_SESSION}`,
          `apps/admin/src/features/demo/interface/actions.ts ${VERIFY_SESSION}`,
          `apps/admin/src/features/demo/interface/actions.ts ${VERIFY_SESSION}`,
          `apps/admin/src/features/demo/interface/default-action.ts ${VERIFY_SESSION}`,
          `apps/admin/src/app/inline-page.tsx ${VERIFY_SESSION}`,
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
          'apps/admin/src/features/demo/interface/bad-import.ts',
          BOUNDARY,
        ),
      ).toHaveLength(1);
    });

    test('shared/auth では auth 以外のサブパスを検出する', () => {
      const found = diagnosticsFor(
        'apps/admin/src/shared/auth/session.ts',
        BOUNDARY,
      );
      expect(found).toHaveLength(1);
      expect(found[0]?.message).toContain("'@repo/database/auth' だけ");
    });

    test("'use server' ファイルで verifySession を先頭で呼ばない export を検出する", () => {
      const found = diagnosticsFor(
        'apps/admin/src/features/demo/interface/actions.ts',
        VERIFY_SESSION,
      );
      const missing = found.filter((diagnostic) =>
        diagnostic.message.includes('認可はこの1行に依存'),
      );
      const unverifiable = found.filter((diagnostic) =>
        diagnostic.message.includes('検証できない'),
      );
      // ngMissingAction / ngNotFirstAction / ngNamedAction の3件
      expect(missing).toHaveLength(3);
      // withMiddleware でラップされた ngWrappedAction の1件
      expect(unverifiable).toHaveLength(1);
    });

    test('export default の Server Action も検出する', () => {
      expect(
        diagnosticsFor(
          'apps/admin/src/features/demo/interface/default-action.ts',
          VERIFY_SESSION,
        ),
      ).toHaveLength(1);
    });

    test("関数単位の 'use server'（インライン Server Action）も検出する", () => {
      expect(
        diagnosticsFor('apps/admin/src/app/inline-page.tsx', VERIFY_SESSION),
      ).toHaveLength(1);
    });
  });
});
