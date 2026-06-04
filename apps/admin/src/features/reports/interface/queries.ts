import { cacheLife } from 'next/cache';

import { fetchReportsOverview } from '../infrastructure/report-repository';

export const getReportsOverview = async () => {
  'use cache';
  cacheLife('minutes');

  const overview = await fetchReportsOverview();
  return overview;
};
