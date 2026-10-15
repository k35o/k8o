import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import betterCssModules from '@better-css-modules/vite';
import { defineMain } from '@storybook/nextjs-vite/node';

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default defineMain({
  stories: ['../src/**/*.stories.tsx'],
  refs: {
    'k8ordo-ui': {
      title: '@k8ordo/ui',
      url: 'https://main--687a213c85e2e4589d8db1bb.chromatic.com',
    },
  },
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-mcp'),
    getAbsolutePath('storybook-addon-mock-date'),
    getAbsolutePath('storybook-addon-determinism'),
  ],
  framework: getAbsolutePath('@storybook/nextjs-vite'),
  features: {
    experimentalRSC: true,
  },
  // Storybook は Vite で組むので、Turbopack の loader の代わりに Vite プラグインで
  // CSS Modules を layer で包む
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), betterCssModules()],
  }),
  staticDirs: ['./public', '../public'],
});
