import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/nextjs-vite';

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  refs: {
    'arte-odyssey': {
      title: 'ArteOdyssey',
      url: 'https://main--687a213c85e2e4589d8db1bb.chromatic.com',
    },
  },
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-mcp'),
    // exports map のみ公開（ルートに preview.js シムがない）ため、絶対パス
    // 指定だと解決できずスキップされる。ベア名指定で exports map 経由で解決する
    'storybook-addon-mock-date',
  ],
  framework: getAbsolutePath('@storybook/nextjs-vite'),
  features: {
    experimentalRSC: true,
  },
  staticDirs: ['./public', '../public'],
};

export default config;
