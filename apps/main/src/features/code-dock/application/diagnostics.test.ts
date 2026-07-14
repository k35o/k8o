import type { OxlintRawOutput } from '../infrastructure/oxlint-runner';
import { toLintDiagnostics } from './diagnostics';

const rawDiagnostic = (
  overrides: Partial<OxlintRawOutput['diagnostics'][number]>,
): OxlintRawOutput['diagnostics'][number] => ({
  code: 'eslint(no-var)',
  labels: [{ span: { column: 1, line: 1 } }],
  message: 'Unexpected var, use let or const instead.',
  severity: 'error',
  ...overrides,
});

describe('toLintDiagnostics', () => {
  describe('正常系', () => {
    it('oxlintの生JSONをドメイン型へ変換する', () => {
      const raw: OxlintRawOutput = {
        diagnostics: [
          rawDiagnostic({
            help: 'Replace var with let or const',
            labels: [{ span: { column: 5, line: 3 } }],
            url: 'https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-var.html',
          }),
        ],
      };

      expect(toLintDiagnostics(raw)).toStrictEqual([
        {
          code: 'eslint(no-var)',
          column: 5,
          help: 'Replace var with let or const',
          line: 3,
          message: 'Unexpected var, use let or const instead.',
          severity: 'error',
          url: 'https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-var.html',
        },
      ]);
    });

    it('行→列の順でソートする', () => {
      const raw: OxlintRawOutput = {
        diagnostics: [
          rawDiagnostic({ labels: [{ span: { column: 9, line: 2 } }] }),
          rawDiagnostic({ labels: [{ span: { column: 1, line: 10 } }] }),
          rawDiagnostic({ labels: [{ span: { column: 2, line: 2 } }] }),
        ],
      };

      expect(
        toLintDiagnostics(raw).map(({ column, line }) => [line, column]),
      ).toStrictEqual([
        [2, 2],
        [2, 9],
        [10, 1],
      ]);
    });
  });

  describe('エッジケース', () => {
    it('labelsが空でも位置をnullとして変換する', () => {
      const raw: OxlintRawOutput = {
        diagnostics: [rawDiagnostic({ labels: [] })],
      };

      const [diagnostic] = toLintDiagnostics(raw);
      expect(diagnostic?.line).toBeNull();
      expect(diagnostic?.column).toBeNull();
    });

    it('位置なしの診断は末尾に並ぶ', () => {
      const raw: OxlintRawOutput = {
        diagnostics: [
          rawDiagnostic({ labels: [] }),
          rawDiagnostic({ labels: [{ span: { column: 1, line: 1 } }] }),
        ],
      };

      expect(toLintDiagnostics(raw).map(({ line }) => line)).toStrictEqual([
        1,
        null,
      ]);
    });

    it('code/url/help/labelsがフィールドごと欠けていてもnullに正規化する', () => {
      // reportUnusedDisableDirectives の「Unused disable directive」診断の実形式
      const raw: OxlintRawOutput = {
        diagnostics: [
          {
            message:
              'Unused oxlint-disable directive (no problems were reported).',
            severity: 'error',
          },
        ],
      };

      expect(toLintDiagnostics(raw)).toStrictEqual([
        {
          code: null,
          column: null,
          help: null,
          line: null,
          message:
            'Unused oxlint-disable directive (no problems were reported).',
          severity: 'error',
          url: null,
        },
      ]);
    });

    it('空文字のコードはnullに正規化する', () => {
      const raw: OxlintRawOutput = {
        diagnostics: [rawDiagnostic({ code: '' })],
      };

      expect(toLintDiagnostics(raw)[0]?.code).toBeNull();
    });

    it('未知のseverityはerrorへ倒す', () => {
      const raw: OxlintRawOutput = {
        diagnostics: [rawDiagnostic({ severity: 'advice' })],
      };

      expect(toLintDiagnostics(raw)[0]?.severity).toBe('error');
    });
  });
});
