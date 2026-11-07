import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { vrt } from 'storybook-addon-vrt/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@playgrounds': fileURLToPath(
        new URL('./src/playgrounds', import.meta.url),
      ),
    },
    coverage: {
      provider: 'v8',
      changed: true,
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
          name: { label: 'components test', color: 'white' },
          // load-section の試験がたどる @k8ordo/ui の dist は CSS を import するので、Node に読ませず Vite で変換する
          server: { deps: { inline: ['@k8ordo/ui'] } },
          include: ['src/components/**/*.test.{ts,tsx}'],
        },
      },
      {
        test: {
          name: { label: 'playgrounds test', color: 'yellow' },
          include: ['src/playgrounds/**/*.test.ts'],
          // sections.ts がたどる @k8ordo/ui の dist は CSS を import するので、Node に読ませず Vite で変換する
          server: { deps: { inline: ['@k8ordo/ui'] } },
        },
      },
      {
        test: {
          name: { label: 'scripts test', color: 'red' },
          include: ['scripts/**/*.test.ts'],
        },
      },
      {
        extends: './.storybook/vite.config.ts',
        plugins: [
          storybookTest({
            storybookScript: 'pnpm storybook --ci',
            configDir: fileURLToPath(new URL('./.storybook', import.meta.url)),
          }),
          vrt(),
        ],
        publicDir: fileURLToPath(
          new URL('./.storybook/public', import.meta.url),
        ),
        test: {
          name: { label: 'storybook', color: 'blue' },
          browser: {
            enabled: true,
            instances: [{ browser: 'chromium' }],
            provider: playwright({
              contextOptions: {
                timezoneId: 'JST',
              },
            }),
            headless: true,
            screenshotFailures: false,
            // @storybook/addon-vitest 10 は Vitest 5 で Story のビューポートを
            // 設定できないため、Storybook の既定値を明示する
            viewport: { width: 1200, height: 900 },
          },
          isolate: false,
          setupFiles: [],
        },
      },
    ],
  },
});
