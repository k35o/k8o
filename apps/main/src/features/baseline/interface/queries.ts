import { cacheLife } from 'next/cache';

import { getPlatformFeatures as _getPlatformFeatures } from '@/features/baseline/application/baseline';
import { getBaselineMinVersions as _getBaselineMinVersions } from '@/features/baseline/application/browser-support';

// oxlint-disable-next-line eslint/require-await, typescript/require-await -- 'use cache' は async 関数を要求する。web-features(ビルド時)由来でデータ取得は同期だが、Date.now() をこのキャッシュ境界内で解決するため async を維持する
export async function getPlatformFeatures() {
  'use cache';
  cacheLife('minutes');

  // 「直近1週間」フィルタと limited の直近1年カットオフの基準時刻。component render では
  // Date.now() を呼べない（React Compiler の purity / 静的プリレンダリングの現在時刻制約）
  // ため、キャッシュ境界内で解決して features と一緒に返す。鮮度は cacheLife('minutes') 相当。
  const nowMs = Date.now();
  return { features: _getPlatformFeatures(nowMs), nowMs };
}

// oxlint-disable-next-line eslint/require-await, typescript/require-await -- 'use cache' は async 関数を要求する。web-features(ビルド時)由来でデータ取得は同期だが、全ページ静的シェルの寿命を握るため 'use cache' を維持する
export async function getBaselineMinVersions() {
  'use cache';
  // RootLayout が Suspense 境界外で await するため、この cacheLife が全ページの
  // 静的シェルの寿命になる。フロアは web-features(ビルド時)由来でデプロイ単位でしか
  // 変わらないので、'days'(revalidate 1日 / expire 1週間)で背景更新に寄せる。
  cacheLife('days');

  const minVersions = _getBaselineMinVersions();
  return minVersions;
}

export { getFeatureStatus } from '@/features/baseline/application/baseline';
export type {
  BrowserAvailability,
  PlatformFeature,
  PlatformStatus,
} from '@/features/baseline/application/baseline';
