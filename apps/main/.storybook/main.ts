import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/nextjs-vite';

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  refs: {
    "arte-odyssey": {
      title: "ArteOdyssey",
      url: "https://main--687a213c85e2e4589d8db1bb.chromatic.com",
    },
  },
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-mcp'),
    getAbsolutePath('storybook-addon-mock-date'),
  ],
  framework: getAbsolutePath('@storybook/nextjs-vite'),
  features: {
    experimentalRSC: true,
  },
  staticDirs: ['./public'],
};

export default config;
