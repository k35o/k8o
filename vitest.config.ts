/// <reference types="vitest" />
import { fileURLToPath } from 'url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookNextJsPlugin } from '@storybook/nextjs-vite/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

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
          name: { label: 'helpers', color: 'blue' },
          include: ['packages/helpers/**/*.test.{ts,tsx}'],
          includeSource: ['packages/helpers/**/*.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: { label: 'services', color: 'cyan' },
          include: ['src/services/**/*.test.{ts,tsx}'],
          includeSource: ['src/services/**/*.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: { label: 'browser', color: 'green' },
          include: ['src/!(services)/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            instances: [
              {
                browser: 'chromium',
                name: 'browser-chromium',
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
        resolve: {
          alias: {
            // @react-email/componentsをモックに置き換え
            '@react-email/components': fileURLToPath(
              new URL(
                './.storybook/mocks/react-email-components.ts',
                import.meta.url,
              ),
            ),
            '@react-email/render': fileURLToPath(
              new URL(
                './.storybook/mocks/react-email-render.ts',
                import.meta.url,
              ),
            ),
            // react-dom/server.browserを通常のreact-dom/serverに置き換え
            'react-dom/server.browser': 'react-dom/server',
          },
        },
        test: {
          name: { label: 'storybook', color: 'magenta' },
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
