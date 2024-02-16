import { type Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        error: colors.red[500],
        errorLight: colors.red[100],
        info: colors.blue[500],
        infoLight: colors.blue[100],
        success: colors.green[500],
        successLight: colors.green[100],
        warning: colors.yellow[500],
        warningLight: colors.yellow[100],
      },
    },
  },
  plugins: [],
} satisfies Config;
