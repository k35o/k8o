import { cacheLife } from 'next/cache';

import { getBrowserSupportFeatures as _getBrowserSupportFeatures } from '@/features/browser-support/application/features';
import { getBrowserMinVersions as _getBrowserMinVersions } from '@/features/browser-support/application/min-versions';

// oxlint-disable-next-line eslint/require-await, typescript/require-await -- 'use cache' は async 関数を要求する。web-features(ビルド時)由来でデータ取得は同期だが、Date.now() をこのキャッシュ境界内で解決するため async を維持する
export async function getBrowserSupportFeatures() {
  'use cache';
  cacheLife('minutes');

  // 「直近1週間」フィルタと limited の直近1年カットオフの基準時刻。component render では
  // Date.now() を呼べない（React Compiler の purity / 静的プリレンダリングの現在時刻制約）
  // ため、キャッシュ境界内で解決して features と一緒に返す。鮮度は cacheLife('minutes') 相当。
  const nowMs = Date.now();
  return { features: _getBrowserSupportFeatures(nowMs), nowMs };
}

// oxlint-disable-next-line eslint/require-await, typescript/require-await -- 'use cache' は async 関数を要求する。web-features(ビルド時)由来でデータ取得は同期だが、全ページ静的シェルの寿命を握るため 'use cache' を維持する
export async function getBrowserMinVersions() {
  'use cache';
  // RootLayout が Suspense 境界外で await するため、この cacheLife が全ページの
  // 静的シェルの寿命になる。フロアは web-features(ビルド時)由来でデプロイ単位でしか
  // 変わらないので、'days'(revalidate 1日 / expire 1週間)で背景更新に寄せる。
  cacheLife('days');

  const minVersions = _getBrowserMinVersions();
  return minVersions;
}

export { getFeatureStatus } from '@/features/browser-support/application/features';
export type {
  BrowserAvailability,
  BrowserSupportFeature,
  SupportStatus,
} from '@/features/browser-support/application/features';
