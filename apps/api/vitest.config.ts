import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      TZ: 'UTC',
    },
    name: { label: 'features test', color: 'cyan' },
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      changed: true,
    },
  },
});
