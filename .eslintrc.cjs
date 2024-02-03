/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "prettier",
    "next/core-web-vitals",
    "plugin:storybook/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  overrides: [
    {
      files: ["*.stories.tsx"],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
}

module.exports = config;
