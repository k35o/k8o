import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    name: { label: 'services test', color: 'cyan' },
    include: ['src/services/**/*.test.{ts,tsx}'],
  },
});
