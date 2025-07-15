import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: false,
      provider: 'istanbul',
    },
    projects: [
      'packages/*',
      'core/vitest.config.ts',
      'core/vitest.browser.config.ts',
    ],
  },
});
