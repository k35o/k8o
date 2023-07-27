/** @type {import("prettier").Config} */
const config = {
  printWidth: 70,
  singleQuote: true,
  plugins: [require("prettier-plugin-tailwindcss")],
};

module.exports = config;
