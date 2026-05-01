import { cacheLife } from 'next/cache';

import { getBaselineFeatures as _getBaselineFeatures } from '@/features/baseline/application/baseline';
import { getFeatureBlogMap as _getFeatureBlogMap } from '@/features/baseline/application/feature-blog-map';

export async function getBaselineFeatures() {
  'use cache';
  cacheLife('minutes');

  const features = await Promise.resolve(_getBaselineFeatures());
  return features;
}

export async function getFeatureBlogMap() {
  'use cache';
  cacheLife('max');

  const featureBlogMap = await Promise.resolve(_getFeatureBlogMap());
  return featureBlogMap;
}

export type { BaselineFeature } from '@/features/baseline/application/baseline';
export type { BlogLink } from '@/features/baseline/application/feature-blog-map';
