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
      provider: 'v8',
      changed: true,
    },
    projects: [
      {
        extends: true,
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
          name: { label: 'services test', color: 'cyan' },
          include: ['src/services/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          env: {
            TZ: 'UTC',
          },
          name: { label: 'libs test', color: 'green' },
          include: ['src/libs/**/*.test.{ts,tsx}'],
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
          },
          isolate: false,
          setupFiles: [],
        },
      },
    ],
  },
});
