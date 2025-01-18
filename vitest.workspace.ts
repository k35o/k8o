import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
import { storybookNextJsPlugin } from '@storybook/experimental-nextjs-vite/vite-plugin';

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
    plugins: [react()],
    test: {
      name: 'browser test',
      include: ['src/!(utils)/**/*.test.{ts,tsx}'],
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
        // TODO: deprecateなので別の方法で書く
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
