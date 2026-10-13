import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      changed: true,
    },
    name: { label: 'code-highlight', color: 'magenta' },
  },
});
