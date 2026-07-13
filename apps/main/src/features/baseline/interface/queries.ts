import { cacheLife, cacheTag } from 'next/cache';

import { getBaselineFeatures as _getBaselineFeatures } from '@/features/baseline/application/baseline';
import { getBaselineMinVersions as _getBaselineMinVersions } from '@/features/baseline/application/browser-support';
import { DB_CONTENT_CACHE_TAG } from '@/shared/cache/cache-tags';

export async function getBaselineFeatures() {
  'use cache';
  cacheLife('minutes');

  const features = await _getBaselineFeatures();
  // 「直近1週間」フィルタの基準時刻。component render では Date.now() を呼べない
  // （React Compiler の purity ルール / 静的プリレンダリングの現在時刻制約）ため、
  // キャッシュ境界内で解決して features と一緒に返す。鮮度は cacheLife('minutes') 相当。
  return { features, nowMs: Date.now() };
}

export async function getBaselineMinVersions() {
  'use cache';
  // RootLayout が Suspense 境界外で await するため、この cacheLife が全ページの
  // 静的シェルの寿命になる。'minutes'(expire 1h) だと低トラフィック時に毎時
  // シェルが動的レンダーへ落ちるので、'days'(revalidate 1日 / expire 1週間)で
  // 背景更新に寄せる。admin の baseline 同期(cron / 手動)は完了後に db-content を
  // 再検証するため、フロア更新はこのタグ経由で即時に反映される
  cacheLife('days');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const minVersions = await _getBaselineMinVersions();
  return minVersions;
}

export type { BaselineFeature } from '@/features/baseline/application/baseline';
