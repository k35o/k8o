import { getBrowserSupportSyncStatus } from '../../browser-support/interface/queries';
import type { BrowserSupportSyncStatus } from '../../browser-support/interface/queries';
import { getSummaryProgress } from '../../reading-list/interface/queries';
import type { SummaryProgress } from '../../reading-list/interface/queries';
import { findOverview } from '../infrastructure/overview-repository';
import type { Overview } from '../infrastructure/overview-repository';

type SiteOverview = Overview & {
  readingList: SummaryProgress;
  browserSupport: BrowserSupportSyncStatus;
};

export const getOverview = async (): Promise<SiteOverview> => {
  const [overview, summaryProgress, browserSupport] = await Promise.all([
    findOverview(),
    getSummaryProgress(),
    getBrowserSupportSyncStatus(),
  ]);
  return {
    ...overview,
    readingList: { ...overview.readingList, ...summaryProgress },
    browserSupport,
  };
};
