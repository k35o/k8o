import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      changed: true,
    },
    name: { label: 'code-highlight', color: 'magenta' },
  },
});
