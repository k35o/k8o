import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineWorkspace([
  {
    extends: 'vitest.config.ts',
    test: {
      name: 'utils test',
      include: ['src/utils/**/*.test.{ts,tsx}'],
      includeSource: ['src/utils/**/*.{ts,tsx}'],
    },
  },
  {
    plugins: [react()],
    extends: 'vitest.config.ts',
    test: {
      name: 'browser test',
      include: ['src/!(utils)/**/*.test.{ts,tsx}'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
        screenshotFailures: false,
      },
    },
  },
]);
