import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    name: { label: 'oxlint-plugin', color: 'yellow' },
  },
});
