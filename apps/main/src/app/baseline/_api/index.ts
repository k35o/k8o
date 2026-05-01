import { cacheLife } from 'next/cache';

import { getBaselineFeatures as _getBaselineFeatures } from '@/services/baseline/baseline';
import { getFeatureBlogMap as _getFeatureBlogMap } from '@/services/baseline/feature-blog-map';

export function getBaselineFeatures() {
  'use cache';
  cacheLife('minutes');

  return _getBaselineFeatures();
}

export function getFeatureBlogMap() {
  'use cache';
  cacheLife('max');

  return _getFeatureBlogMap();
}
