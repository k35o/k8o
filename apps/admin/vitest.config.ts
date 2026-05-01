import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname === 'undefined' ? import.meta.dirname : __dirname;

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
        test: {
          env: {
            TZ: 'UTC',
          },
          name: { label: 'features test', color: 'cyan' },
          include: ['src/features/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        optimizeDeps: {
          include: [
            'next/link',
            'better-auth/react',
            '@repo/helpers > date-fns',
            '@repo/helpers > date-fns/locale',
          ],
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          isolate: false,
          setupFiles: [],
        },
      },
    ],
  },
});
