import { type Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.teal[700],
        primaryHover: colors.teal[800],
        primaryActive: colors.teal[900],
        gray: colors.gray[100],
        grayHover: colors.gray[200],
        grayActive: colors.gray[300],
        textGray: colors.gray[700],
        link: colors.blue[600],
        error: colors.red[500],
        errorLight: colors.red[100],
        info: colors.blue[500],
        infoLight: colors.blue[100],
        success: colors.green[500],
        successLight: colors.green[100],
        warning: colors.yellow[500],
        warningLight: colors.yellow[100],
        border: colors.gray[600],
        bgBase: colors.slate[300],
        bgLight: colors.slate[200],
        bgDark: colors.slate[800],
        focusRing: colors.blue[500],
      },
    },
  },
  plugins: [],
} satisfies Config;
