import { cacheLife } from 'next/cache';

import {
  fetchSnapshotStats,
  findSnapshots,
} from '../infrastructure/browser-support-repository';
import type {
  FindSnapshotsParams,
  FindSnapshotsResult,
} from '../infrastructure/browser-support-repository';

export const getSnapshotStats = async () => {
  'use cache';
  cacheLife('minutes');

  const stats = await fetchSnapshotStats();
  return stats;
};

export const getSnapshots = async (
  params: FindSnapshotsParams,
): Promise<FindSnapshotsResult> => {
  'use cache';
  cacheLife('minutes');

  const result = await findSnapshots(params);
  return result;
};

export type {
  SnapshotRecord,
  SnapshotStatus,
} from '../infrastructure/browser-support-repository';
