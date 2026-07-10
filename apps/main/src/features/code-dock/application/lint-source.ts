import { runOxlint } from '../infrastructure/oxlint-runner';
import { toLintDiagnostics } from './diagnostics';
import type { LintDiagnostic } from './diagnostics';
import type { LintLanguage } from './language';
import { buildOxlintrc } from './oxlintrc';

// 設定は不変なのでモジュール読み込み時に一度だけ直列化する
const OXLINTRC_JSON = JSON.stringify(buildOxlintrc());

export const lintSource = async (
  code: string,
  language: LintLanguage,
): Promise<LintDiagnostic[]> => {
  const raw = await runOxlint(code, `input.${language}`, OXLINTRC_JSON);
  return toLintDiagnostics(raw);
};
