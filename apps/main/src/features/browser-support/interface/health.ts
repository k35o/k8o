import { getBrowserMinVersions } from '@/features/browser-support/application/min-versions';
import {
  fetchBrowserSupportHealth,
  findActiveBaselineDataset,
} from '@/features/browser-support/infrastructure/browser-support-dataset-repository';
import type { BrowserSupportHealth } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';

// 同期の心拍が生きていると見なす上限。日次 cron + 余裕(発火時刻のずれ・単発の失敗)。
const HEARTBEAT_STALE_HOURS = 30;

type BrowserSupportHealthStatus = 'ok' | 'stale' | 'degraded';

export type BrowserSupportHealthReport = BrowserSupportHealth & {
  status: BrowserSupportHealthStatus;
  // コミット済みフロア(RootLayoutが読む生成物)が active データセットのフロアと
  // ずれているか。ずれの警報 push は同期時の1回きりなので、ここで継続的に可視化する。
  floorStale: boolean;
};

// 外形監視(GitHub Actions)向け。'use cache' は付けない: 監視が読むのは常に現在の
// 状態でなければならない。
export async function getBrowserSupportHealth(): Promise<BrowserSupportHealthReport> {
  let health: BrowserSupportHealth;
  try {
    health = await fetchBrowserSupportHealth();
  } catch {
    // 監視対象の DB が死んでいるのに health が青いのは異常。degraded で返す。
    return {
      status: 'degraded',
      activeVersion: null,
      activeIngestedAt: null,
      lastSuccessAt: null,
      lastRun: null,
      floorStale: false,
    };
  }

  const heartbeatAlive =
    health.lastSuccessAt !== null &&
    Date.now() - new Date(health.lastSuccessAt).getTime() <
      HEARTBEAT_STALE_HOURS * 60 * 60 * 1000;

  // findActiveBaselineDataset は DB 障害時に null へ減衰するため、ここでは throw しない。
  const active = await findActiveBaselineDataset();
  const committedFloor = getBrowserMinVersions();
  const floorStale =
    active !== null &&
    JSON.stringify(active.dataset.minVersions) !==
      JSON.stringify(committedFloor);

  return {
    status: heartbeatAlive && health.activeVersion !== null ? 'ok' : 'stale',
    floorStale,
    ...health,
  };
}
