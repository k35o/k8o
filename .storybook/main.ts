import type { StorybookConfig } from '@storybook/nextjs';
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],

  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-addon-mock-date',
    '@storybook/experimental-addon-test',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  features: {
    experimentalRSC: true,
  },

  docs: {
    autodocs: 'tag',
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  staticDirs: ['./public'],
};
export default config;
