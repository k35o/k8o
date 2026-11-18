import {
  transformUpstreamData,
  UpstreamFormatError,
} from '@repo/helpers/baseline/transform-upstream';

import { DAY_MS } from '../../../shared/time/day-ms';
import type {
  BrowserSupportSyncResult,
  BrowserSupportSyncTrigger,
} from '../infrastructure/browser-support-repository';
import {
  applyDataset,
  findActiveDataset,
  recordSyncRun,
} from '../infrastructure/browser-support-repository';
import {
  discoverLatestVersion,
  fetchUpstreamData,
  UpstreamDiscoveryError,
} from '../infrastructure/upstream-release-source';
import {
  countDiff,
  diffBaselineFeatures,
  hasDiff,
  minVersionsChanged,
  toFeatureChangeRows,
} from './baseline-diff';
import type { BaselineDiffCounts } from './baseline-diff';
import { checkBaselineInvariants } from './baseline-invariants';
import {
  discoveryFailedAlert,
  formatBrokenAlert,
  invariantRejectedAlert,
  majorChangedAlert,
  minVersionsChangedAlert,
  updateNotification,
  upstreamStaleAlert,
  warningAlert,
} from './sync-notifications';
import type { SyncNotification } from './sync-notifications';

// 対応している上流メジャー。上流が v4 を出したら取り込みを止めて警報し、
// 型・変換・検証を確認してからこの定数を上げる。
const SUPPORTED_MAJOR = 3;

// 上流のリリース間隔は平均約8日。45日更新が無いのは上流停滞かバージョン発見の
// 故障のどちらかなので、情報として警報する。
const UPSTREAM_STALE_DAYS = 45;

export type SyncNotifier = (notification: SyncNotification) => Promise<void>;

export type SyncSummary = BaselineDiffCounts & {
  result: BrowserSupportSyncResult;
  upstreamVersion: string | null;
  detail: string | null;
};

const NO_CHANGES: BaselineDiffCounts = {
  newlyCount: 0,
  widelyCount: 0,
  statusChangeCount: 0,
};

export async function syncBrowserSupport({
  trigger,
  force = false,
  notify,
}: {
  trigger: BrowserSupportSyncTrigger;
  force?: boolean;
  notify: SyncNotifier;
}): Promise<SyncSummary> {
  const startedAt = Date.now();

  const finish = async (
    summary: Omit<SyncSummary, keyof BaselineDiffCounts> &
      Partial<BaselineDiffCounts>,
  ): Promise<SyncSummary> => {
    const full: SyncSummary = { ...NO_CHANGES, ...summary };
    // 心拍: 変化が無かった noop も含め、全ての実行を記録する
    await recordSyncRun({
      trigger,
      result: full.result,
      upstreamVersion: full.upstreamVersion,
      detail: full.detail,
      durationMs: Date.now() - startedAt,
    });
    return full;
  };

  // 1. バージョン発見。失敗は transient (次回リトライ)。恒久化は外形監視が拾う。
  let discovered;
  try {
    discovered = await discoverLatestVersion();
  } catch (error) {
    // Location の構造変化(発見の契約破壊)は transient ではないので警報も出す
    if (error instanceof UpstreamDiscoveryError) {
      await notify(discoveryFailedAlert(error.message, new Date()));
    }
    return finish({
      result: 'fetch_failed',
      upstreamVersion: null,
      detail: String(error),
    });
  }
  const { version, major } = discovered;

  // 2. メジャーガード。v4 を黙って飲まない(fail-closed)。
  if (major !== SUPPORTED_MAJOR) {
    await notify(majorChangedAlert(version, major));
    return finish({
      result: 'skipped_major',
      upstreamVersion: version,
      detail: `supported=${String(SUPPORTED_MAJOR)}`,
    });
  }

  const active = await findActiveDataset();

  // 3. 既知バージョンなら noop。上流の停滞だけ確認する。
  if (active?.upstreamVersion === version && !force) {
    const ageMs = Date.now() - new Date(active.ingestedAt).getTime();
    if (ageMs > UPSTREAM_STALE_DAYS * DAY_MS) {
      await notify(upstreamStaleAlert(version, UPSTREAM_STALE_DAYS));
    }
    return finish({ result: 'noop', upstreamVersion: version, detail: null });
  }

  // 4. 取得
  let raw: unknown;
  try {
    raw = await fetchUpstreamData(version);
  } catch (error) {
    return finish({
      result: 'fetch_failed',
      upstreamVersion: version,
      detail: String(error),
    });
  }

  // 5. 変換(腐敗防止層) + 意味的不変条件。失敗時は DB に触れず前回データを維持する。
  let transformed;
  try {
    transformed = transformUpstreamData(raw, version);
  } catch (error) {
    if (error instanceof UpstreamFormatError) {
      await notify(formatBrokenAlert(version, error.message));
      return finish({
        result: 'validation_failed',
        upstreamVersion: version,
        detail: error.message,
      });
    }
    throw error;
  }
  const { dataset, skippedFeatures } = transformed;

  const { violations, warnings } = checkBaselineInvariants({
    dataset,
    previous: active?.dataset ?? null,
    skippedCount: skippedFeatures.length,
  });
  if (violations.length > 0) {
    const detail = violations.join(' / ');
    await notify(invariantRejectedAlert(version, detail));
    return finish({
      result: 'validation_failed',
      upstreamVersion: version,
      detail,
    });
  }

  // 6. 差分抽出(置換前のactiveと比較)
  const diff =
    active === null
      ? null
      : diffBaselineFeatures(dataset.features, active.dataset.features);

  // 7. 世代置換。変更履歴も同一バッチで書く(初回取り込みは diff が無いので履歴なし)
  try {
    await applyDataset(dataset, diff === null ? [] : toFeatureChangeRows(diff));
  } catch (error) {
    return finish({
      result: 'db_failed',
      upstreamVersion: version,
      detail: String(error),
    });
  }

  // 8. 通知。初回取り込みは全件が「新規」になってしまうため通知しない。
  if (diff !== null) {
    if (hasDiff(diff)) {
      await notify(updateNotification(version, diff));
    }
    if (
      minVersionsChanged(active?.dataset.minVersions ?? {}, dataset.minVersions)
    ) {
      await notify(minVersionsChangedAlert(version));
    }
  }
  if (warnings.length > 0) {
    await notify(warningAlert(version, warnings));
  }

  return finish({
    result: 'applied',
    upstreamVersion: version,
    detail:
      skippedFeatures.length > 0
        ? `skipped: ${String(skippedFeatures.length)}件`
        : null,
    ...(diff === null ? NO_CHANGES : countDiff(diff)),
  });
}
