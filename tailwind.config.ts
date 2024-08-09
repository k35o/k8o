import { type Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.teal[700],
        primaryLight: colors.teal[400],
        primaryHover: colors.teal[800],
        primaryActive: colors.teal[900],
        gray: colors.gray[100],
        grayHover: colors.gray[100],
        grayActive: colors.gray[300],
        textGray: colors.gray[700],
        link: colors.blue[600],
        error: colors.red[600],
        errorLight: colors.red[100],
        info: colors.blue[600],
        infoLight: colors.blue[100],
        success: colors.green[700],
        successLight: colors.green[100],
        warning: colors.yellow[700],
        warningLight: colors.yellow[100],
        border: colors.gray[600],
        borderLight: colors.gray[300],
        bgBase: colors.slate[300],
        bgLight: colors.slate[200],
        bgDark: colors.slate[800],
        focusRing: colors.blue[500],
      },
      fontFamily: {
        notoSansJp: ['var(--font-noto-sans-jp)'],
      },
      gridTemplateColumns: {
        'col-fill': 'repeat(auto-fill, 1fr)',
      },
      aria: {
        invalid: 'invalid="true"',
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'grid-cols-auto-fill': (value) => ({
            gridTemplateColumns: `repeat(auto-fill, minmax(min(${value}, 100%), 1fr))`,
          }),
          'grid-cols-auto-fit': (value) => ({
            gridTemplateColumns: `repeat(auto-fit, minmax(min(${value}, 100%), 1fr))`,
          }),
          'grid-rows-auto-fill': (value) => ({
            gridTemplateRows: `repeat(auto-fill, minmax(min(${value}, 100%), 1fr))`,
          }),
          'grid-rows-auto-fit': (value) => ({
            gridTemplateRows: `repeat(auto-fit, minmax(min(${value}, 100%), 1fr))`,
          }),
        },
        {
          values: theme('width', {}),
        },
      );
    }),
  ],
} satisfies Config;

export default config;
