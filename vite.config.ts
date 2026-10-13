import { fmt, nextjs, tailwind, test, TEST_GLOBS } from '@k8o/oxc-config';
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

export default defineConfig({
  fmt: {
    ...fmt,
    ignorePatterns,
  },
  lint: {
    extends: [nextjs, tailwind],
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
      tailwindcss: {
        // 対象ファイルと CSS エントリーポイントの対応を glob で明示する（先勝ちで評価される）。
        entryPoint: [
          {
            files: 'apps/main/**',
            use: 'apps/main/src/app/_styles/globals.css',
          },
          {
            files: 'apps/ai/**',
            use: 'apps/ai/src/app/_styles/globals.css',
          },
          // packages 配下など app に属さない共有コード（cn.ts のテスト内
          // class 文字列など）向けのフォールバック。先勝ちのため各 app の
          // マッピングが優先される。
          {
            files: '**',
            use: 'apps/main/src/app/_styles/globals.css',
          },
        ],
      },
    },
    rules: {
      // DB パッケージ（@repo/database・@repo/ai-database）の import 層を強制する
      'k8o/database-import-boundary': 'error',
      // font-mono（next/font 絡みで別途対応）と、Playground がコンポーネント内の <style> で
      // 定義したクラスを未知のクラスとして報告する。この2つが片付くまでは off にする
      'tailwindcss/no-unknown-classes': 'off',
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
            {
              patterns: [
                {
                  group: ['drizzle-orm', 'drizzle-orm/*'],
                  message:
                    'drizzle は DB パッケージ経由で使う（演算子などは @repo/database/orm か @repo/ai-database/orm）。apps が drizzle-orm を直接持つと DB パッケージの db と別の実体になり、型が噛み合わなくなる。',
                },
              ],
            },
          ],
        },
      },
      { files: [...TEST_GLOBS], ...test },
    ],
  },
  staged: {
    '*.{js,ts,tsx,json,jsonc}':
      'vp check --fix --no-error-on-unmatched-pattern',
  },
});
