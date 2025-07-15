import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    name: { label: 'helpers', color: 'blue' },
    includeSource: ['src/**/*.{ts,tsx}'],
  },
});
