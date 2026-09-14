import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { vrt } from 'storybook-addon-vrt/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig の jsx: preserve に従うと JSX が変換されず node 環境のテストが動かない
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    coverage: {
      provider: 'v8',
      changed: true,
    },
    projects: [
      {
        resolve: {
          alias: {
            'server-only': fileURLToPath(
              new URL('./src/mocks/empty.ts', import.meta.url),
            ),
            'next/cache': fileURLToPath(
              new URL('./src/mocks/next-cache.ts', import.meta.url),
            ),
          },
        },
        test: {
          env: {
            TZ: 'UTC',
          },
          name: { label: 'features test', color: 'cyan' },
          include: ['src/features/**/*.test.{ts,tsx}'],
        },
      },
      {
        test: {
          env: {
            TZ: 'UTC',
          },
          name: { label: 'shared test', color: 'green' },
          include: ['src/shared/**/*.test.{ts,tsx}'],
        },
      },
      {
        test: {
          env: {
            TZ: 'UTC',
          },
          name: { label: 'app test', color: 'yellow' },
          include: ['src/app/**/*.test.{ts,tsx}'],
        },
      },
      {
        plugins: [
          storybookTest({
            storybookScript: 'pnpm storybook --ci',
            configDir: fileURLToPath(new URL('./.storybook', import.meta.url)),
          }),
          vrt(),
        ],
        publicDir: fileURLToPath(
          new URL('./.storybook/public', import.meta.url),
        ),
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
              },
            }),
            headless: true,
            screenshotFailures: false,
            // @storybook/addon-vitest 10 は Vitest 5 で Story のビューポートを
            // 設定できないため、Storybook の既定値を明示する
            viewport: { width: 1200, height: 900 },
          },
          isolate: false,
          setupFiles: [],
        },
      },
    ],
  },
});
