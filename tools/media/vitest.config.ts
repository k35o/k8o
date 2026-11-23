import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: { label: 'media', color: 'green' },
    include: ['src/**/*.test.ts'],
  },
});
