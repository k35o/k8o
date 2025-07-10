import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    name: { label: 'services', color: 'cyan' },
    includeSource: ['src/**/*.{ts,tsx}'],
  },
});
