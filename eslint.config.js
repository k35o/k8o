import { FlatCompat } from '@eslint/eslintrc';
import configPrettier from "eslint-config-prettier";
import storybook from 'eslint-plugin-storybook'
import jsxA11y from 'eslint-plugin-jsx-a11y';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/**
 * @type {import('eslint').Linter.Config}
 */
const eslintConfig = [
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
  }
]
export default eslintConfig