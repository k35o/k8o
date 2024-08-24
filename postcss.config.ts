import { Config } from 'postcss-load-config';

const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
} satisfies Config;

export default config;
