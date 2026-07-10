import { runOxfmt } from '../infrastructure/oxfmt-runner';
import type { LintLanguage } from './language';

export type FormatSourceResult =
  | { ok: true; code: string }
  | { ok: false; message: string };

export const formatSource = async (
  code: string,
  language: LintLanguage,
): Promise<FormatSourceResult> => {
  const result = await runOxfmt(code, `input.${language}`);
  const firstError = result.errors[0];
  if (firstError) {
    return { message: firstError.message, ok: false };
  }
  return { code: result.code, ok: true };
};
