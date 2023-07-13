/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "prettier",
    "next/core-web-vitals",
    "plugin:storybook/recommended",
    "plugin:jsx-a11y/recommended"
  ]
}

module.exports = config;
