import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    storybookTest({
      storybookScript: 'pnpm storybook --ci',
      configDir: fileURLToPath(new URL('./.storybook', import.meta.url)),
    }),
  ],
  publicDir: fileURLToPath(new URL('./.storybook/public', import.meta.url)),
  optimizeDeps: {
    include: ['drizzle-orm/neon-serverless'],
  },
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
        new URL('./.storybook/mocks/react-email-render.ts', import.meta.url),
      ),
      // react-dom/server.browserを通常のreact-dom/serverに置き換え
      'react-dom/server.browser': 'react-dom/server',
    },
  },
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    name: { label: 'storybook', color: 'magenta' },
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
    isolate: false,
    setupFiles: [
      fileURLToPath(new URL('./.storybook/vitest.setup.ts', import.meta.url)),
    ],
    // NOTE: コンポーネントが自動的にclient componentsに解釈されるので、async/awaitコンポーネントは除外する
    // TODO: async/awaitコンポーネントのテストも実行できるようにする
    exclude: [
      '**/blog-layout.stories.tsx',
      '**/blog-layout/**/recommend.stories.tsx',
    ],
  },
});
