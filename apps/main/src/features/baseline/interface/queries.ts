import { cacheLife } from 'next/cache';
import { getBaselineFeatures as _getBaselineFeatures } from '@/features/baseline/application/baseline';
import { getFeatureBlogMap as _getFeatureBlogMap } from '@/features/baseline/application/feature-blog-map';

export async function getBaselineFeatures() {
  'use cache';
  cacheLife('minutes');

  return await _getBaselineFeatures();
}

export async function getFeatureBlogMap() {
  'use cache';
  cacheLife('max');

  return await _getFeatureBlogMap();
}

export type { BaselineFeature } from '@/features/baseline/application/baseline';
export type { BlogLink } from '@/features/baseline/application/feature-blog-map';
