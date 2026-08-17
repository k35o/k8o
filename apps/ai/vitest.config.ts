import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jsxAutomaticPlugin } from '@repo/vitest-config/jsx-automatic';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { vrt } from 'storybook-addon-vrt/vitest-plugin';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname === 'undefined' ? import.meta.dirname : __dirname;

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    coverage: {
      provider: 'v8',
      changed: true,
    },
    projects: [
      {
        extends: true,
        plugins: [jsxAutomaticPlugin],
        test: {
          env: {
            TZ: 'UTC',
          },
          name: { label: 'features test', color: 'cyan' },
          include: [
            'src/features/**/*.test.{ts,tsx}',
            'src/shared/**/*.test.{ts,tsx}',
          ],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
          vrt(),
        ],
        optimizeDeps: {
          include: [
            'next/link',
            'better-auth/react',
            // 二重 React を防ぐため、registry（@json-render/react を内包）は
            // アプリ本体と同じ最適化パイプラインで事前バンドルする。
            '@k8o/arte-odyssey/json-render/registry',
          ],
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          isolate: false,
          setupFiles: [],
        },
      },
    ],
  },
});
