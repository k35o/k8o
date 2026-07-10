'use server';

import * as z from 'zod/mini';

import { configureZod } from '@/shared/validation/zod';

import type { LintDiagnostic } from '../application/diagnostics';
import { formatSource } from '../application/format-source';
import { LINT_LANGUAGES, MAX_CODE_LENGTH } from '../application/language';
import { lintSource } from '../application/lint-source';

configureZod();

const codeDockSchema = z.object({
  code: z.string().check(z.maxLength(MAX_CODE_LENGTH)),
  language: z.enum(LINT_LANGUAGES),
});

export type LintCodeResult =
  | { diagnostics: LintDiagnostic[]; error?: never }
  | { diagnostics?: never; error: string };

export type FormatCodeResult =
  | { code: string; error?: never }
  | { code?: never; error: string };

export const lintCode = async (
  code: string,
  language: string,
): Promise<LintCodeResult> => {
  const validated = codeDockSchema.safeParse({ code, language });
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message ?? '入力が不正です',
    };
  }
  try {
    const diagnostics = await lintSource(
      validated.data.code,
      validated.data.language,
    );
    return { diagnostics };
  } catch (error) {
    console.error('lintCode failed:', error);
    return { error: 'コードの検査に失敗しました' };
  }
};

export const formatCode = async (
  code: string,
  language: string,
): Promise<FormatCodeResult> => {
  const validated = codeDockSchema.safeParse({ code, language });
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message ?? '入力が不正です',
    };
  }
  try {
    const result = await formatSource(
      validated.data.code,
      validated.data.language,
    );
    if (!result.ok) {
      return { error: `整形できませんでした: ${result.message}` };
    }
    return { code: result.code };
  } catch (error) {
    console.error('formatCode failed:', error);
    return { error: 'コードの整形に失敗しました' };
  }
};
