import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    name: { label: 'services test', color: 'cyan' },
    include: ['src/services/**/*.test.{ts,tsx}'],
  },
});
