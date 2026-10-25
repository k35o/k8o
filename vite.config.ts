import { fmt, nextjs, test, TEST_GLOBS } from '@k8o/oxc-config';
import { defineConfig } from 'vite-plus';

const ignorePatterns = [
  '.agents/**',
  '**/mockServiceWorker.js',
  '**/migrations/meta/**',
  '**/public/**',
  '**/*.md',
  '**/*.mdx',
  '.claude/worktrees/**',
  // CI用スクリプト。tsconfig外の .mjs のため型情報前提のルールが誤検知する
  '.github/scripts/**',
  // カスタムルールのテスト用fixture。意図的な違反コードを含む
  'packages/oxlint-plugin/tests/fixtures/**',
];

const drizzleImportPattern = {
  group: ['drizzle-orm', 'drizzle-orm/*'],
  message:
    'drizzle は DB パッケージ経由で使う（演算子などは @repo/database/orm か @repo/ai-database/orm）。apps が drizzle-orm を直接持つと DB パッケージの db と別の実体になり、型が噛み合わなくなる。',
};

export default defineConfig({
  fmt: {
    ...fmt,
    ignorePatterns,
  },
  lint: {
    extends: [nextjs],
    // リポジトリ固有のカスタムルール（k8o/*）。実装は packages/oxlint-plugin
    jsPlugins: ['@repo/oxlint-plugin'],
    ignorePatterns,
    options: {
      reportUnusedDisableDirectives: 'error',
    },
    settings: {
      next: {
        rootDir: ['apps/main', 'apps/ai'],
      },
      react: {
        version: '19.3.0',
      },
    },
    rules: {
      // DB パッケージ（@repo/database・@repo/ai-database）の import 層を強制する
      'k8o/database-import-boundary': 'error',
    },
    overrides: [
      {
        files: ['**/*.d.ts'],
        rules: {
          'typescript/consistent-indexed-object-style': 'off',
          'typescript/consistent-type-definitions': 'off',
        },
      },
      {
        files: ['apps/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            { patterns: [drizzleImportPattern] },
          ],
        },
      },
      {
        files: ['apps/main/src/content/**', 'apps/main/src/playgrounds/**'],
        rules: {
          // override は規則の設定を丸ごと置き換えるので、apps/** の drizzle の制限も並べる
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                drizzleImportPattern,
                {
                  group: ['next', 'next/**', 'next-themes', '@/**'],
                  message:
                    '記事とデモは Next に依らずに描けるように保つ（k8ordo 版の main が写さずに読む）。Next と、読む側で指す先の変わる @/ を import しない。',
                },
              ],
            },
          ],
        },
      },
      {
        // main は画像を AVIF に変換してコミットし、Vercel の画像最適化に頼らず素の img で描く
        files: ['apps/main/**'],
        rules: { '@next/next/no-img-element': 'off' },
      },
      { files: [...TEST_GLOBS], ...test },
    ],
  },
  staged: {
    '*.{js,ts,tsx,json,jsonc,css}':
      'vp check --fix --no-error-on-unmatched-pattern',
  },
});
