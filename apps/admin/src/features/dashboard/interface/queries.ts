import { cacheLife } from 'next/cache';

import { fetchDashboardSummary } from '../infrastructure/dashboard-repository';

export const getDashboardSummary = async () => {
  'use cache';
  cacheLife('minutes');

  const summary = await fetchDashboardSummary();
  return summary;
};
