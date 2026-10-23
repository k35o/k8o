import type { BaselineFeature } from '@repo/helpers/baseline/model';
import {
  RECENT_CHANGES_LIMIT,
  RECENT_CHANGES_WINDOW_MS,
  selectFeatureStatus,
  selectFeedFeatures,
} from '@repo/helpers/baseline/select';
import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import { BROWSER_SUPPORT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';

import { getBrowserMinVersions as _getBrowserMinVersions } from '@/features/browser-support/application/min-versions';
import { findRecentFeatureChanges } from '@/features/browser-support/infrastructure/browser-support-change-repository';
import type { BrowserSupportFeatureChange } from '@/features/browser-support/infrastructure/browser-support-change-repository';
import { findActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';
import type { ActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';

// active データセットの共有ローダー。フィードと MDX の feature 解決が個別に DB を
// 読まないよう、キャッシュ境界をここに一本化する。鮮度は TTL ではなく api の同期
// 成功時の /api/revalidate(タグ再検証)で担保するため、寿命は 'days' に寄せる。
// 'minutes' にすると <BrowserSupportStatus> を埋め込んだブログ記事の静的シェルまで
// 分単位の ISR + DB 依存になってしまう。
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
  features: BaselineFeature[];
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
): Promise<BaselineFeature | null> {
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
  BaselineBrowserSupport as BrowserAvailability,
  BaselineFeature as BrowserSupportFeature,
  BaselineSupportStatus as SupportStatus,
} from '@repo/helpers/baseline/model';
export type { BrowserSupportFeatureChange } from '@/features/browser-support/infrastructure/browser-support-change-repository';
