import { fmt, nextjs, tailwind, test } from '@k8o/oxc-config';
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
  // プレビュー用の独立テンプレート（独自の依存・規約。生成コードを流し込むため lint 対象外）
  'apps/ai/sandbox-template/**',
  // bake 等の一度きり CLI。tsconfig外の .mjs のため型情報前提のルールが誤検知する
  'apps/ai/scripts/**',
];

export default defineConfig({
  fmt: {
    ...fmt,
    ignorePatterns,
  },
  lint: {
    extends: [nextjs, tailwind],
    ignorePatterns,
    options: {
      reportUnusedDisableDirectives: 'error',
      typeAware: true,
    },
    settings: {
      next: {
        rootDir: ['apps/main', 'apps/admin', 'apps/ai'],
      },
      react: {
        version: '19.2.7',
      },
      tailwindcss: {
        // oxlint-tailwindcss v1 から、対象ファイルと CSS エントリーポイントの
        // 対応を glob で明示する形式に変更された（先勝ちで評価される）。
        entryPoint: [
          {
            files: 'apps/main/**',
            use: 'apps/main/src/app/_styles/globals.css',
          },
          {
            files: 'apps/admin/**',
            use: 'apps/admin/src/app/_styles/globals.css',
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
      // 既存コードの意図を変える修正が大量に必要なルールは、初回移行では段階導入にする。
      'import/no-unassigned-import': [
        'error',
        { allow: ['**/*.css', '@/libs/zod', 'react', 'server-only'] },
      ],
      // `_schema` / `_utils` などのアンダースコア接頭辞は @repo/database の
      // 内部API（直接アクセス非推奨）を表す規約として使っているため許可する。
      'no-underscore-dangle': 'off',
      // ArteOdyssey の restricted theme に無いクラス(font-mono/rounded/text-base 等)を
      // 正しく検出するが、実問題の修正は設計判断(代替トークン)を要し件数も多い。
      // 大量の警告出力で vite-plus が CI の stdout で panic するため一旦 off にし、
      // クラスの棚卸しは別タスクで対応する。
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
        files: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/*.stories.ts',
          '**/*.stories.tsx',
        ],
        plugins: [...(test.plugins ?? [])],
        rules: {
          ...test.rules,
          'typescript/unbound-method': 'off',
          // vi.fn() を型パラメータなしで使う書き方を許容する。
          'vitest/require-mock-type-parameters': 'off',
          // URL バリデーションのテストで javascript: スキームを不正入力として渡すため許可する。
          'no-script-url': 'off',
          // 0.2.0 で新規追加された警告。207件の toEqual→toStrictEqual 一括置換は
          // 本PRのスコープ外(staged hook 経由で漸進移行する想定)。大量出力で
          // vite-plus が CI の stdout で panic するため一旦 off にする。
          'vitest/prefer-strict-equal': 'off',
        },
      },
    ],
  },
  staged: {
    '*.{js,ts,tsx,json,jsonc}':
      'vp check --fix --no-error-on-unmatched-pattern',
  },
});
