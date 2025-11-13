import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: false,
      provider: 'istanbul',
    },
    projects: [
      'packages/helpers/vitest.config.ts',
      'packages/core/vitest.config.service.ts',
      'packages/core/vitest.config.browser.ts',
    ],
  },
});
