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
      'apps/main/vitest.config.service.ts',
      'apps/main/vitest.config.browser.ts',
    ],
  },
});
