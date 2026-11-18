import {
  findActiveDatasetMeta,
  findRecentSyncRuns,
} from '../infrastructure/browser-support-repository';
import type { SyncRunSummary } from '../infrastructure/browser-support-repository';

export type BrowserSupportSyncStatus = {
  activeVersion: string | null;
  activeIngestedAt: string | null;
  lastRun: SyncRunSummary | null;
};

export const getBrowserSupportSyncStatus =
  async (): Promise<BrowserSupportSyncStatus> => {
    const [active, runs] = await Promise.all([
      findActiveDatasetMeta(),
      findRecentSyncRuns(1),
    ]);
    const lastRun = runs[0];
    return {
      activeVersion: active?.upstreamVersion ?? null,
      activeIngestedAt: active?.ingestedAt ?? null,
      lastRun:
        lastRun === undefined
          ? null
          : {
              result: lastRun.result,
              trigger: lastRun.trigger,
              createdAt: lastRun.createdAt,
            },
    };
  };
