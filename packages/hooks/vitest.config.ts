import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      name: { label: 'hooks', color: 'green' },
      include: ['src/**/*.test.{ts,tsx}'],
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
  }),
);
