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
      'import/no-unassigned-import': [
        'error',
        { allow: ['**/*.css', '@/libs/zod', 'react', 'server-only'] },
      ],
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
        files: ['packages/database/src/schema/**/*.ts'],
        rules: {
          'import/no-cycle': 'off',
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
        },
      },
    ],
  },
  staged: {
    '*.{js,ts,tsx,json,jsonc}':
      'vp check --fix --no-error-on-unmatched-pattern',
  },
});
