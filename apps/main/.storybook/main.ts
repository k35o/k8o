import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineMain } from '@storybook/react-vite/node';

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
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    // 指定しないとアプリの vite.config.ts を読み、framework() と vercel() まで載る
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  // 記事・デモ・public は apps/main のものを読む（vite.config.ts の publicDir と同じ）
  staticDirs: ['./public', '../../main/public'],
});
