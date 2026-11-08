import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';

import floorData from '../infrastructure/browser-min-versions.json';

// DB の active データセットではなく、ビルドのターゲット（site/browser-targets.ts）と同じコミット済みの
// 生成物から読み、画面に出すフロアと変換のターゲットをそろえる
export function getBrowserMinVersions(): BrowserMinVersions {
  return floorData.minVersions;
}
