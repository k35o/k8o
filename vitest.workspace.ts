import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookNextJsPlugin } from '@storybook/nextjs-vite/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: 'vitest.config.ts',
    test: {
      name: 'utils test',
      include: ['src/utils/**/*.test.{ts,tsx}'],
      includeSource: ['src/utils/**/*.{ts,tsx}'],
    },
  },
  {
    extends: 'vitest.config.ts',
    test: {
      name: 'services test',
      include: ['src/services/**/*.test.{ts,tsx}'],
      includeSource: ['src/services/**/*.{ts,tsx}'],
    },
  },
  {
    extends: 'vitest.config.ts',
    plugins: [react()],
    test: {
      name: 'browser test',
      include: ['src/!(utils|services)/**/*.test.{ts,tsx}'],
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
    extends: 'vitest.config.ts',
    plugins: [
      storybookTest({
        storybookScript: 'pnpm storybook --ci',
      }),
      storybookNextJsPlugin(),
    ],
    publicDir: '.storybook/public/',
    test: {
      name: 'storybook test',
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
]);
