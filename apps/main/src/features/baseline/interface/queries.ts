import { cacheLife } from 'next/cache';

import { getBaselineFeatures as _getBaselineFeatures } from '@/features/baseline/application/baseline';
import { getBaselineMinVersions as _getBaselineMinVersions } from '@/features/baseline/application/browser-support';

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
  cacheLife('minutes');

  const minVersions = await _getBaselineMinVersions();
  return minVersions;
}

export type { BaselineFeature } from '@/features/baseline/application/baseline';
