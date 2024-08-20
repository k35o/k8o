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
      // foreground
      textBody: 'var(--text-body)',
      textDescription: 'var(--text-description)',
      textLink: 'var(--text-link)',
      textOnFill: 'var(--text-on-fill)',
      textHighlight: 'var(--text-highlight)',
      textError: 'var(--text-error)',
      textSuccess: 'var(--text-success)',
      textWarning: 'var(--text-warning)',
      textInfo: 'var(--text-info)',
      // background
      bgBase: 'var(--bg-base)',
      bgPrimary: 'var(--bg-primary)',
      bgSecondary: 'var(--bg-secondary)',
      bgTertiary: 'var(--bg-tertiary)',
      bgError: 'var(--bg-error)',
      bgSuccess: 'var(--bg-success)',
      bgWarning: 'var(--bg-warning)',
      bgInfo: 'var(--bg-info)',
      bgHover: 'var(--bg-hover)',
      bgActive: 'var(--bg-active)',
      bgTransparent: 'var(--bg-transparent)',
      bgBackDrop: 'var(--bg-back-drop)',
      // border
      borderPrimary: 'var(--border-primary)',
      borderSecondary: 'var(--border-secondary)',
      borderFocus: 'var(--border-focus)',
      borderDisabled: 'var(--border-disabled)',
      borderError: 'var(--border-error)',
      borderSuccess: 'var(--border-success)',
      borderWarning: 'var(--border-warning)',
      borderInfo: 'var(--border-info)',
      borderTransparent: 'var(--border-transparent)',
      // button
      buttonPrimary: 'var(--button-primary)',
      buttonHover: 'var(--button-hover)',
      buttonActive: 'var(--button-active)',
      // chart
      chartPrimary: 'var(--chart-primary)',
      chartEmpty: 'var(--chart-empty)',
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
