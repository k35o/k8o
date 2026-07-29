import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import { CORE_BROWSERS } from '@repo/helpers/browser/detect-browser';

import floorData from '../infrastructure/browser-min-versions.json';

// フロアは RootLayout(全ページの静的シェル)が読むため、実行時 I/O(DB・ネットワーク)に
// 依存させない。コミット済み生成物を読むだけにし、どの外部依存が落ちても全ページは無傷。
// 再生成: pnpm run -F main generate:browser-min-versions
// (上流でフロアが変わると admin の同期 cron が push 通知で再生成を促す)
export function getBrowserMinVersions(): BrowserMinVersions {
  const source: Record<string, string | undefined> = floorData.minVersions;
  const minVersions: BrowserMinVersions = {};
  for (const browser of CORE_BROWSERS) {
    const version = source[browser];
    if (version !== undefined) {
      minVersions[browser] = version;
    }
  }
  return minVersions;
}
