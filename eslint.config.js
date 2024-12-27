import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import configPrettier from "eslint-config-prettier";
import storybook from 'eslint-plugin-storybook'
import jsxA11y from 'eslint-plugin-jsx-a11y';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/**
 * @type {import('eslint').Linter.Config}
 */
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  ...compat.config({
    extends: ['next/core-web-vitals'],
  }),
  configPrettier,
  ...storybook.configs['flat/recommended'],
  {
    ...jsxA11y.flatConfigs.recommended,
    plugins: { 'jsx-a11y': jsxA11y },
  },
  {
    files: ['*.stories.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
);