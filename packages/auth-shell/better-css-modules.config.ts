import { defineConfig } from '@better-css-modules/core';

// グローバル CSS はアプリ側にあるので、トークンはデザインシステムのものを読む。
// ai はこのパッケージを source のまま読み、ai の next build（tsc）が rootDirs の外の
// 生成物を見られないので、型はスタイルシートの隣に出してコミットする
export default defineConfig({
  globalCss: ['@k8ordo/ui/styles.css'],
  layer: 'components',
  outDir: '.',
});
