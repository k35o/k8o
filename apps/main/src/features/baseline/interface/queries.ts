import { cacheLife } from 'next/cache';

import { getBaselineFeatures as _getBaselineFeatures } from '@/features/baseline/application/baseline';
import { getBaselineMinVersions as _getBaselineMinVersions } from '@/features/baseline/application/browser-support';
import { getFeatureBlogMap as _getFeatureBlogMap } from '@/features/baseline/application/feature-blog-map';

export async function getBaselineFeatures() {
  'use cache';
  cacheLife('minutes');

  const features = await _getBaselineFeatures();
  return features;
}

export async function getFeatureBlogMap() {
  'use cache';
  cacheLife('max');

  const featureBlogMap = await _getFeatureBlogMap();
  return featureBlogMap;
}

export async function getBaselineMinVersions() {
  'use cache';
  cacheLife('minutes');

  const minVersions = await _getBaselineMinVersions();
  return minVersions;
}

export type { BaselineFeature } from '@/features/baseline/application/baseline';
export type { BlogLink } from '@/features/baseline/application/feature-blog-map';
export type { BaselineMinVersions } from '@repo/helpers/browser/detect-browser';
