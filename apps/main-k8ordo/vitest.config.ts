import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@playgrounds': fileURLToPath(
        new URL('../main/src/playgrounds', import.meta.url),
      ),
    },
    projects: [
      {
        test: {
          name: { label: 'site test', color: 'cyan' },
          include: ['src/site/**/*.test.ts'],
        },
      },
      {
        test: {
          env: { TZ: 'UTC' },
          name: { label: 'features test', color: 'magenta' },
          include: ['src/features/**/*.test.ts'],
        },
      },
      {
        test: {
          name: { label: 'shared test', color: 'green' },
          include: ['src/shared/**/*.test.{ts,tsx}'],
        },
      },
      {
        test: {
          name: { label: 'dependencies test', color: 'yellow' },
          include: ['src/*.test.ts'],
        },
      },
    ],
  },
});
