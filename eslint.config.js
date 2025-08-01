import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import storybookPlugin from 'eslint-plugin-storybook';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';
import drizzlePlugin from 'eslint-plugin-drizzle';

/**
 * @type {import('eslint').Linter.Config}
 */
export default tseslint.config(
  {
    name: 'global ignores',
    ignores: ['**/*.d.ts'],
  },
  {
    name: 'declare eslint plugins',
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['import']: importPlugin,
      ['jsx-a11y']:
        jsxA11yPlugin.flatConfigs.recommended.plugins['jsx-a11y'],
      ['drizzle']: drizzlePlugin,
      ['@next/next']: nextPlugin,
    },
  },

  {
    name: 'eslint recommended',
    ...eslint.configs.recommended,
  },
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    name: 'eslint-config-prettier',
    ...eslintConfigPrettier,
  },
  ...storybookPlugin.configs['flat/recommended'],
  jsxA11yPlugin.flatConfigs.recommended,
  {
    name: 'next',
    files: ['core/**/*.{ts,tsx}'],
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    settings: {
      next: {
        rootDir: 'core/',
      },
    },
  },
  {
    name: 'next opengraph images',
    files: ['core/**/opengraph-image.{ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  {
    name: 'other rules',
    files: ['**/*.{ts,tsx}'],
    rules: {
      ...drizzlePlugin.configs.recommended.rules,
      ...importPlugin.flatConfigs.recommended.rules,
      ...importPlugin.flatConfigs.typescript.rules,
      semi: 'off',
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'type',
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            ['sibling', 'parent'],
            'index',
            'object',
          ],
          alphabetize: { order: 'asc' },
        },
      ],
      'import/namespace': 'off',
    },
    settings: {
      ...importPlugin.flatConfigs.typescript.settings,
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            'tsconfig.json',
            'core/tsconfig.json',
            'packages/*/tsconfig.json',
          ],
        },
      },
    },
  },

  {
    name: 'language options',
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    name: 'test',
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
