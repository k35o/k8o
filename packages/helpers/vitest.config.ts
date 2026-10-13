import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      changed: true,
    },
    env: {
      TZ: 'UTC',
    },
    name: { label: 'helpers', color: 'blue' },
    includeSource: ['src/**/*.{ts,tsx}'],
  },
});
