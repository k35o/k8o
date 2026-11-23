import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: { label: 'talk-deck', color: 'yellow' },
    include: ['src/**/*.test.ts'],
  },
});
