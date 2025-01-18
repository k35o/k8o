/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  test: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    globals: true,
    coverage: {
      all: false,
      provider: 'istanbul',
    },
    // NOTE: コンポーネントが自動的にclient componentsに解釈されるので、async/awaitコンポーネントは除外する
    // TODO: async/awaitコンポーネントのテストも実行できるようにする
    exclude: [
      'src/app/blog/_components/view-counter/view-counter.stories.tsx',
      'src/app/blog/_components/blog-layout/blog-layout.stories.tsx',
    ],
  },
});
