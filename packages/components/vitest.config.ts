import { fileURLToPath } from 'url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { defineConfig } from 'vitest/config';
import { storybookNextJsPlugin } from '@storybook/nextjs-vite/vite-plugin';

export default defineConfig({
  plugins: [
    storybookTest({
      storybookScript: 'pnpm storybook --ci',
      configDir: fileURLToPath(
        new URL('./.storybook', import.meta.url),
      ),
    }),
    storybookNextJsPlugin(),
  ],
  publicDir: fileURLToPath(
    new URL('./.storybook/public', import.meta.url),
  ),
  test: {
    globals: true,
    name: { label: 'components', color: 'magenta' },
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
      screenshotFailures: false,
    },
    isolate: false,
    setupFiles: [
      fileURLToPath(
        new URL('./.storybook/vitest.setup.ts', import.meta.url),
      ),
    ],
  },
});
