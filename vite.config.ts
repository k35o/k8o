import { fmt, nextjs, tailwind, test } from '@k8o/oxc-config';
import { defineConfig } from 'vite-plus';

const ignorePatterns = [
  '.agents/**',
  '**/mockServiceWorker.js',
  '**/migrations/meta/**',
  '**/*.md',
  '**/*.mdx',
  '.claude/worktrees/**',
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
        rootDir: ['apps/main', 'apps/admin'],
      },
      react: {
        version: '19.2.5',
      },
      tailwindcss: {
        entryPoint: ['apps/main/src/app/_styles/globals.css'],
      },
    },
    rules: {
      // 既存コードの意図を変える修正が大量に必要なルールは、初回移行では段階導入にする。
      'no-await-in-loop': 'off',
      'no-inline-comments': 'off',
      'no-useless-return': 'off',
      'import/max-dependencies': 'off',
      'import/no-cycle': 'off',
      'import/no-unassigned-import': 'off',
      'promise/always-return': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',
      'typescript/consistent-return': 'off',
      'typescript/no-base-to-string': 'off',
      'typescript/no-floating-promises': 'off',
      'typescript/no-misused-promises': 'off',
      'typescript/no-redundant-type-constituents': 'off',
      'typescript/no-unnecessary-condition': 'off',
      'typescript/no-unsafe-argument': 'off',
      'typescript/no-unsafe-assignment': 'off',
      'typescript/no-unsafe-call': 'off',
      'typescript/no-unsafe-member-access': 'off',
      'typescript/strict-boolean-expressions': 'off',
      'typescript/strict-void-return': 'off',
      'typescript/unbound-method': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'oxc/no-accumulating-spread': 'off',
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
        rules: test.rules ?? {},
      },
    ],
  },
  staged: {
    '*.{js,ts,tsx,json,jsonc}':
      'vp check --fix --no-error-on-unmatched-pattern',
  },
});
