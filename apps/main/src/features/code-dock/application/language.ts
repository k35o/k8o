export const LINT_LANGUAGES = ['ts', 'tsx', 'js', 'jsx'] as const;

export type LintLanguage = (typeof LINT_LANGUAGES)[number];

export const isLintLanguage = (value: string): value is LintLanguage =>
  (LINT_LANGUAGES as readonly string[]).includes(value);

// 認証なしの公開エンドポイントのため、CPU 濫用を防ぐ入力上限 (100KB)
export const MAX_CODE_LENGTH = 100_000;
