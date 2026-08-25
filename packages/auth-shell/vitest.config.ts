import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      changed: true,
    },
    name: { label: 'auth-shell', color: 'magenta' },
  },
});
