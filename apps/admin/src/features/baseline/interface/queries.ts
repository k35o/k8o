import { cacheLife } from 'next/cache';

import {
  fetchBaselineSnapshotStats,
  fetchBrowserSupport,
  findBaselineSnapshots,
} from '../infrastructure/baseline-repository';
import type {
  FindBaselineSnapshotsParams,
  FindBaselineSnapshotsResult,
} from '../infrastructure/baseline-repository';

export const getBaselineSnapshotStats = async () => {
  'use cache';
  cacheLife('minutes');

  const stats = await fetchBaselineSnapshotStats();
  return stats;
};

export const getBaselineSnapshots = async (
  params: FindBaselineSnapshotsParams,
): Promise<FindBaselineSnapshotsResult> => {
  'use cache';
  cacheLife('minutes');

  const result = await findBaselineSnapshots(params);
  return result;
};

export const getBrowserSupport = async () => {
  'use cache';
  cacheLife('minutes');

  const support = await fetchBrowserSupport();
  return support;
};

export type {
  BaselineSnapshotRecord,
  BaselineStatus,
} from '../infrastructure/baseline-repository';
