import { cacheLife } from 'next/cache';

import {
  type FindBaselineSnapshotsParams,
  type FindBaselineSnapshotsResult,
  fetchBaselineSnapshotStats,
  findBaselineSnapshots,
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

export type {
  BaselineSnapshotRecord,
  BaselineStatus,
} from '../infrastructure/baseline-repository';
