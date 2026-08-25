import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import { BROWSER_SUPPORT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';

import {
  selectFeatureStatus,
  selectFeedFeatures,
} from '@/features/browser-support/application/features';
import type { BrowserSupportFeature } from '@/features/browser-support/application/features';
import { getBrowserMinVersions as _getBrowserMinVersions } from '@/features/browser-support/application/min-versions';
import { findRecentFeatureChanges } from '@/features/browser-support/infrastructure/browser-support-change-repository';
import type { BrowserSupportFeatureChange } from '@/features/browser-support/infrastructure/browser-support-change-repository';
import { findActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';
import type { ActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';

// active データセットの共有ローダー。フィードと MDX の feature 解決が個別に DB を
// 読まないよう、キャッシュ境界をここに一本化する。鮮度は TTL ではなく admin の同期
// 成功時の /api/revalidate(タグ再検証)で担保するため、寿命は 'days' に寄せる。
// 'minutes' にすると <BrowserSupportStatus> を埋め込んだブログ記事の静的シェルまで
// 分単位の ISR + DB 依存になってしまう。
// oxlint-disable-next-line eslint/require-await, typescript/require-await -- 'use cache' は async 関数を要求する
async function getActiveDataset(): Promise<ActiveBaselineDataset | null> {
  'use cache';
  cacheLife('days');
  cacheTag(BROWSER_SUPPORT_CACHE_TAG);

  return findActiveBaselineDataset();
}

export type BrowserSupportMeta = {
  upstreamVersion: string;
  ingestedAt: string;
};

export async function getBrowserSupportFeatures(): Promise<{
  features: BrowserSupportFeature[];
  nowMs: number;
  // データ同期前(空DB)は null。呼び出し側は空状態を表示する。
  meta: BrowserSupportMeta | null;
}> {
  'use cache';
  cacheLife('minutes');
  cacheTag(BROWSER_SUPPORT_CACHE_TAG);

  // 「直近1週間」フィルタと limited の直近1年カットオフの基準時刻。component render では
  // Date.now() を呼べないため、キャッシュ境界内で解決して features と一緒に返す。
  const nowMs = Date.now();
  const active = await getActiveDataset();
  if (active === null) {
    return { features: [], nowMs, meta: null };
  }
  return {
    features: selectFeedFeatures(active.dataset, nowMs),
    nowMs,
    meta: {
      upstreamVersion: active.upstreamVersion,
      ingestedAt: active.ingestedAt,
    },
  };
}

// 「最近の更新」の表示窓。同期時に記録した changedAt 基準なので、上流の baseline
// 日付のラグに左右されず「このサイトが取り込んだ時点」からの新しさで絞れる。
const RECENT_CHANGES_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
// 上流の一括再計算などで異常に膨らんだ場合の表示上限
const RECENT_CHANGES_LIMIT = 100;

export async function getRecentBrowserSupportChanges(): Promise<
  BrowserSupportFeatureChange[]
> {
  'use cache';
  cacheLife('minutes');
  cacheTag(BROWSER_SUPPORT_CACHE_TAG);

  const since = new Date(Date.now() - RECENT_CHANGES_WINDOW_MS).toISOString();
  const changes = await findRecentFeatureChanges(since, RECENT_CHANGES_LIMIT);
  return changes;
}

export async function getFeatureStatus(
  featureId: string,
): Promise<BrowserSupportFeature | null> {
  const active = await getActiveDataset();
  if (active === null) {
    return null;
  }
  return selectFeatureStatus(active.dataset, featureId);
}

// フロアはコミット済み生成物(実行時 I/O ゼロ)。RootLayout が全ページの静的シェルで
// 読むため、DB やキャッシュに依存させない。
export function getBrowserMinVersions(): BrowserMinVersions {
  return _getBrowserMinVersions();
}

export type {
  BrowserAvailability,
  BrowserSupportFeature,
  SupportStatus,
} from '@/features/browser-support/application/features';
export type { BrowserSupportFeatureChange } from '@/features/browser-support/infrastructure/browser-support-change-repository';
