import { defineConfig } from '@better-css-modules/core';

// グローバル CSS はアプリ側にあるので、トークンはデザインシステムのものを読む
export default defineConfig({
  globalCss: ['@k8ordo/ui/styles.css'],
  layer: 'components',
});
