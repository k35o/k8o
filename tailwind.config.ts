import { type Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.tsx', './.storybook/preview.tsx'],
  theme: {
    colors: {
      // foreground
      textBody: 'rgb(var(--text-body) / <alpha-value>)',
      textDescription: 'rgb(var(--text-description) / <alpha-value>)',
      textLink: 'rgb(var(--text-link) / <alpha-value>)',
      textOnFill: 'rgb(var(--text-on-fill) / <alpha-value>)',
      textHighlight: 'rgb(var(--text-highlight) / <alpha-value>)',
      textError: 'rgb(var(--text-error) / <alpha-value>)',
      textSuccess: 'rgb(var(--text-success) / <alpha-value>)',
      textWarning: 'rgb(var(--text-warning) / <alpha-value>)',
      textInfo: 'rgb(var(--text-info) / <alpha-value>)',
      // background
      bgBase: 'rgb(var(--bg-base) / <alpha-value>)',
      bgPrimary: 'rgb(var(--bg-primary) / <alpha-value>)',
      bgSecondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
      bgTertiary: 'rgb(var(--bg-tertiary) / <alpha-value>)',
      bgCodeBlock: 'rgb(var(--bg-code-block) / <alpha-value>)',
      bgError: 'rgb(var(--bg-error) / <alpha-value>)',
      bgSuccess: 'rgb(var(--bg-success) / <alpha-value>)',
      bgWarning: 'rgb(var(--bg-warning) / <alpha-value>)',
      bgInfo: 'rgb(var(--bg-info) / <alpha-value>)',
      bgHover: 'rgb(var(--bg-hover) / <alpha-value>)',
      bgActive: 'rgb(var(--bg-active) / <alpha-value>)',
      bgTransparent: 'var(--bg-transparent)',
      bgBackDrop: 'rgb(var(--bg-back-drop))',
      // border
      borderPrimary: 'rgb(var(--border-primary) / <alpha-value>)',
      borderSecondary: 'rgb(var(--border-secondary) / <alpha-value>)',
      borderFocus: 'rgb(var(--border-focus) / <alpha-value>)',
      borderDisabled: 'rgb(var(--border-disabled) / <alpha-value>)',
      borderError: 'rgb(var(--border-error) / <alpha-value>)',
      borderSuccess: 'rgb(var(--border-success) / <alpha-value>)',
      borderWarning: 'rgb(var(--border-warning) / <alpha-value>)',
      borderInfo: 'rgb(var(--border-info) / <alpha-value>)',
      borderTransparent: 'var(--border-transparent)',
      // button
      buttonPrimary: 'rgb(var(--button-primary) / <alpha-value>)',
      buttonHover: 'rgb(var(--button-hover) / <alpha-value>)',
      buttonActive: 'rgb(var(--button-active) / <alpha-value>)',
      // chart
      chartPrimary: 'rgb(var(--chart-primary) / <alpha-value>)',
      chartEmpty: 'rgb(var(--chart-empty) / <alpha-value>)',
      // group
      groupPrimary: 'rgb(var(--group-primary) / <alpha-value>)',
      groupSecondary: 'rgb(var(--group-secondary) / <alpha-value>)',
      groupTertiary: 'rgb(var(--group-tertiary) / <alpha-value>)',
      groupQuaternary: 'rgb(var(--group-quaternary) / <alpha-value>)',
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
