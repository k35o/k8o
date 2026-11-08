import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      TZ: 'UTC',
    },
    name: { label: 'helpers', color: 'blue' },
    includeSource: ['src/**/*.{ts,tsx}'],
  },
});
