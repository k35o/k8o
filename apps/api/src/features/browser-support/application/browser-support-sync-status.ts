import {
  findActiveDatasetMeta,
  findRecentSyncRuns,
} from '../infrastructure/browser-support-repository';
import type {
  ActiveDatasetMeta,
  SyncRunSummary,
} from '../infrastructure/browser-support-repository';

export type BrowserSupportSyncStatus = {
  dataset: ActiveDatasetMeta | null;
  lastRun: SyncRunSummary | null;
};

export const getBrowserSupportSyncStatus =
  async (): Promise<BrowserSupportSyncStatus> => {
    const [dataset, runs] = await Promise.all([
      findActiveDatasetMeta(),
      findRecentSyncRuns(1),
    ]);
    return { dataset, lastRun: runs[0] ?? null };
  };
