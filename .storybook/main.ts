import type { StorybookConfig } from '@storybook/nextjs';
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],

  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-vitest',
    '@storybook/addon-docs',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  features: {
    experimentalRSC: true,
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  staticDirs: ['./public'],
};
export default config;
