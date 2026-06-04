import { cacheLife } from 'next/cache';

import { fetchBaselineSnapshotStats } from '../infrastructure/baseline-repository';

export const getBaselineSnapshotStats = async () => {
  'use cache';
  cacheLife('minutes');

  const stats = await fetchBaselineSnapshotStats();
  return stats;
};
