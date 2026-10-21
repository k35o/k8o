import { getSummaryProgress } from '../../reading-list/interface/queries';
import type { SummaryProgress } from '../../reading-list/interface/queries';
import { findOverview } from '../infrastructure/overview-repository';
import type { Overview } from '../infrastructure/overview-repository';

type SiteOverview = Overview & { readingList: SummaryProgress };

export const getOverview = async (): Promise<SiteOverview> => {
  const [overview, summaryProgress] = await Promise.all([
    findOverview(),
    getSummaryProgress(),
  ]);
  return {
    ...overview,
    readingList: { ...overview.readingList, ...summaryProgress },
  };
};
