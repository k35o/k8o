import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    coverage: {
      provider: 'istanbul',
    },
    projects: [
      {
        extends: true,
        test: {
          env: {
            TZ: 'UTC',
          },
          setupFiles: ['./vitest.setup.ts'],
          name: { label: 'services test', color: 'cyan' },
          include: ['src/services/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            storybookScript: 'pnpm storybook --ci',
            configDir: fileURLToPath(new URL('./.storybook', import.meta.url)),
          }),
        ],
        publicDir: fileURLToPath(
          new URL('./.storybook/public', import.meta.url),
        ),
        resolve: {
          alias: {
            'react-dom/server.browser': 'react-dom/server',
          },
        },
        test: {
          name: { label: 'storybook', color: 'magenta' },
          browser: {
            enabled: true,
            instances: [
              {
                browser: 'chromium',
              },
            ],
            provider: playwright({
              contextOptions: {
                timezoneId: 'JST',
                // デスクトップサイズでテストを実行（レスポンシブUIの正常動作のため）
                viewport: { width: 1280, height: 720 },
              },
            }),
            headless: true,
            screenshotFailures: false,
          },
          isolate: false,
          setupFiles: [
            fileURLToPath(
              new URL('./.storybook/vitest.setup.ts', import.meta.url),
            ),
          ],
          // NOTE: コンポーネントが自動的にclient componentsに解釈されるので、async/awaitコンポーネントは除外する
          // TODO: async/awaitコンポーネントのテストも実行できるようにする
          exclude: [
            '**/blog-layout.stories.tsx',
            '**/blog-layout/**/recommend.stories.tsx',
          ],
        },
      },
    ],
  },
});
