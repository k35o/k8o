/** @type {import("prettier").Config} */
const config = {
  printWidth: 70,
  singleQuote: true,
  plugins: [import("prettier-plugin-tailwindcss")],
};

export default config;
