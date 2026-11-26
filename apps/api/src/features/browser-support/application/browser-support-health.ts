import type { BaselineDataset } from '@repo/helpers/baseline/model';

import {
  findActiveDataset,
  findRecentSyncRuns,
} from '../infrastructure/browser-support-repository';
import type {
  ActiveDatasetMeta,
  ActiveDatasetRecord,
  BrowserSupportSyncResult,
  SyncRunSummary,
} from '../infrastructure/browser-support-repository';

// 同期の心拍が生きていると見なす上限。日次 cron に、発火時刻のずれと単発の失敗の余裕を足す
const HEARTBEAT_STALE_MS = 30 * 60 * 60 * 1000;
// 最後の run と最後の成功は、直近の run から決める（クエリを増やさない）
const RECENT_RUNS_LIMIT = 20;
// 見るのはパイプラインが動いているかだけなので、変化の無い noop と、v4 対応待ちで意図して
// 保留した skipped_major も成功に数える。データの古さは同期の警報が別に知らせる
const HEARTBEAT_RESULTS: ReadonlySet<BrowserSupportSyncResult> = new Set([
  'applied',
  'noop',
  'skipped_major',
]);

type BrowserSupportHealth = {
  status: 'ok' | 'stale' | 'degraded';
  dataset:
    | (ActiveDatasetMeta & { minVersions: BaselineDataset['minVersions'] })
    | null;
  lastSuccessAt: string | null;
  lastRun: SyncRunSummary | null;
};

export const getBrowserSupportHealth = async (
  nowMs: number,
): Promise<BrowserSupportHealth> => {
  let active: ActiveDatasetRecord | null;
  let runs: SyncRunSummary[];
  try {
    [active, runs] = await Promise.all([
      findActiveDataset(),
      findRecentSyncRuns(RECENT_RUNS_LIMIT),
    ]);
  } catch (error) {
    // 500 にせず degraded を返し、監視が api に届かないことと DB の障害を見分けられるようにする
    console.error('browser-support の health の読み取りに失敗しました:', error);
    return {
      status: 'degraded',
      dataset: null,
      lastSuccessAt: null,
      lastRun: null,
    };
  }

  const lastSuccessAt =
    runs.find((run) => HEARTBEAT_RESULTS.has(run.result))?.createdAt ?? null;
  const heartbeatAlive =
    lastSuccessAt !== null &&
    nowMs - new Date(lastSuccessAt).getTime() < HEARTBEAT_STALE_MS;

  return {
    status: heartbeatAlive && active !== null ? 'ok' : 'stale',
    dataset:
      active === null
        ? null
        : {
            upstreamVersion: active.upstreamVersion,
            ingestedAt: active.ingestedAt,
            minVersions: active.dataset.minVersions,
          },
    lastSuccessAt,
    lastRun: runs[0] ?? null,
  };
};
