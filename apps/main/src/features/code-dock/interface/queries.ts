import { cacheLife } from 'next/cache';

import type { LintDiagnostic } from '../application/diagnostics';
import { lintSource } from '../application/lint-source';
import { DEFAULT_SAMPLE_CODE, DEFAULT_SAMPLE_LANGUAGE } from './default-sample';

// 初期サンプルは全訪問者共通で、oxlint 設定が変わらない限り結果も不変。デプロイ
// 単位でキャッシュし、マウント時に全訪問者が oxlint の子プロセスを起動するのを避ける
export async function getDefaultLintDiagnostics(): Promise<LintDiagnostic[]> {
  'use cache';
  cacheLife('max');

  const diagnostics = await lintSource(
    DEFAULT_SAMPLE_CODE,
    DEFAULT_SAMPLE_LANGUAGE,
  );
  return diagnostics;
}
