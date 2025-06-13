/// <reference types="vitest" />
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookNextJsPlugin } from '@storybook/nextjs-vite/vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    coverage: {
      all: false,
      provider: 'istanbul',
    },
    // NOTE: コンポーネントが自動的にclient componentsに解釈されるので、async/awaitコンポーネントは除外する
    // TODO: async/awaitコンポーネントのテストも実行できるようにする
    exclude: [
      '**/blog-layout.stories.tsx',
      '**/blog-layout/**/recommend.stories.tsx',
    ],
    projects: [
      {
        extends: true,
        test: {
          name: { label: 'helpers test', color: 'blue' },
          include: ['src/helpers/**/*.test.{ts,tsx}'],
          includeSource: ['src/helpers/**/*.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: { label: 'services test', color: 'cyan' },
          include: ['src/services/**/*.test.{ts,tsx}'],
          includeSource: ['src/services/**/*.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: { label: 'browser test', color: 'green' },
          include: ['src/!(helpers|services)/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            instances: [
              {
                browser: 'chromium',
              },
            ],
            provider: 'playwright',
            headless: true,
            screenshotFailures: false,
          },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            storybookScript: 'pnpm storybook --ci',
          }),
          storybookNextJsPlugin(),
        ],
        publicDir: '.storybook/public/',
        test: {
          name: { label: 'storybook test', color: 'magenta' },
          browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
            screenshotFailures: false,
          },
          isolate: false,
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
