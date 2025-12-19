import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul',
    },
    env: {
      TZ: 'UTC',
    },
    name: { label: 'helpers', color: 'blue' },
    includeSource: ['src/**/*.{ts,tsx}'],
  },
});
