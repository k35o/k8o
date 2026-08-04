import { defineConfig, devices } from '@playwright/test';

const PORT = 3105;

export const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // CI のコールドコンパイルでは初回ナビゲーションに時間がかかるため長めに取る
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `pnpm exec next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: process.env['CI'] === undefined,
    timeout: 120_000,
  },
});
