import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    name: { label: 'hooks', color: 'green' },
    include: ['src/**/*.test.{ts,tsx}'],
    browser: {
      enabled: true,
      instances: [
        {
          browser: 'chromium',
        },
      ],
      provider: 'playwright',
      headless: true,
      screenshotFailures: false,
    },
  },
});
