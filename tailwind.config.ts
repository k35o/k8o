import { type Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './.storybook/preview.tsx',
  ],
  theme: {
    colors: {
      white: 'var(--white)',
      transparent: 'var(--transparent)',
      primary: 'var(--primary)',
      primaryLight: 'var(--primary-light)',
      primaryHover: 'var(--primary-hover)',
      primaryActive: 'var(--primary-active)',
      gray: 'var(--gray)',
      grayHover: 'var(--gray-hover)',
      grayActive: 'var(--gray-active)',
      textBase: 'var(--text-base)',
      textGray: 'var(--text-gray)',
      link: 'var(--link)',
      error: 'var(--error)',
      errorLight: 'var(--error-light)',
      info: 'var(--info)',
      infoLight: 'var(--info-light)',
      success: 'var(--success)',
      successLight: 'var(--success-light)',
      warning: 'var(--warning)',
      warningLight: 'var(--warning-light)',
      border: 'var(--border)',
      borderLight: 'var(--border-light)',
      bgBase: 'var(--bg-base)',
      bgLight: 'var(--bg-light)',
      bgDark: 'var(--bg-dark)',
      bgBackDrop: 'var(--bg-backdrop)',
      focusRing: 'var(--focus-ring)',
    },
    extend: {
      fontFamily: {
        notoSansJp: ['var(--font-noto-sans-jp)'],
      },
      aria: {
        invalid: 'invalid="true"',
      },
      maxHeight: {
        lg: '32rem',
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
