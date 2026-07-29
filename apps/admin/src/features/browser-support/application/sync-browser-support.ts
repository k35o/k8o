import type {
  BrowserSupportSyncResult,
  BrowserSupportSyncTrigger,
} from '@repo/database/schema';
import { checkBaselineInvariants } from '@repo/helpers/baseline/invariants';
import type { BaselineFeature } from '@repo/helpers/baseline/model';
import {
  transformUpstreamData,
  UpstreamFormatError,
} from '@repo/helpers/baseline/transform-upstream';

import { revalidateMainCache } from '@/shared/cache/revalidate-main';

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

// 対応している上流メジャー。上流が v4 を出したら取り込みを止めて警報し、
// 型・変換・検証を確認してからこの定数を上げる。
const SUPPORTED_MAJOR = 3;

// 上流のリリース間隔は平均約8日。45日更新が無いのは上流停滞かバージョン発見の
// 故障のどちらかなので、情報として警報する。
const UPSTREAM_STALE_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

// main 側の browser-support 系 'use cache' に付与しているタグと揃える。
const BROWSER_SUPPORT_CACHE_TAG = 'browser-support';

type SyncNotification = {
  kind: 'update' | 'alert';
  title: string;
  body: string;
  dedupeKey: string;
};

export type SyncNotifier = (notification: SyncNotification) => Promise<void>;

export type SyncSummary = {
  result: BrowserSupportSyncResult;
  upstreamVersion: string | null;
  newlyCount: number;
  widelyCount: number;
  statusChangeCount: number;
  detail: string | null;
};

export type BaselineDiff = {
  // baseline(newly/widely)に新規到達した feature
  reached: BaselineFeature[];
  // newly -> widely などの baseline 内ステータス変化
  statusChanges: Array<{ feature: BaselineFeature; previousStatus: string }>;
};

// 通知用の差分。前回データセットとの比較で「新規 baseline 到達」と「ステータス変化」を
// 抽出する。limited のままの変化は通知対象にしない(従来仕様)。
export const diffBaselineFeatures = (
  current: BaselineFeature[],
  previous: BaselineFeature[],
): BaselineDiff => {
  const previousStatusById = new Map(
    previous.map((f) => [f.featureId, f.status]),
  );
  const reached: BaselineFeature[] = [];
  const statusChanges: BaselineDiff['statusChanges'] = [];

  for (const feature of current) {
    if (feature.status === 'limited') {
      continue;
    }
    const prev = previousStatusById.get(feature.featureId);
    if (prev === undefined || prev === 'limited') {
      reached.push(feature);
      continue;
    }
    if (prev !== feature.status) {
      statusChanges.push({ feature, previousStatus: prev });
    }
  }

  return { reached, statusChanges };
};

const buildUpdateBody = (diff: BaselineDiff): string => {
  const parts: string[] = [];
  const newlyCount = diff.reached.filter((f) => f.status === 'newly').length;
  const widelyCount = diff.reached.filter((f) => f.status === 'widely').length;
  if (newlyCount > 0) {
    parts.push(`Newly: ${String(newlyCount)}件`);
  }
  if (widelyCount > 0) {
    parts.push(`Widely: ${String(widelyCount)}件`);
  }
  if (diff.statusChanges.length > 0) {
    parts.push(`ステータス変更: ${String(diff.statusChanges.length)}件`);
  }
  return parts.join('、');
};

const minVersionsChanged = (
  prev: Record<string, string | undefined>,
  next: Record<string, string | undefined>,
): boolean => {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    if (prev[key] !== next[key]) {
      return true;
    }
  }
  return false;
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
    summary: Omit<
      SyncSummary,
      'newlyCount' | 'widelyCount' | 'statusChangeCount'
    > &
      Partial<SyncSummary>,
  ): Promise<SyncSummary> => {
    const full: SyncSummary = {
      newlyCount: 0,
      widelyCount: 0,
      statusChangeCount: 0,
      ...summary,
    };
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
      await notify({
        kind: 'alert',
        title: 'Browser Support同期: バージョン発見に失敗',
        body: error.message,
        dedupeKey: `browser-support:alert:discovery:${new Date().toISOString().slice(0, 10)}`,
      });
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
    await notify({
      kind: 'alert',
      title: 'Browser Support同期: 上流メジャーバージョン変化',
      body: `web-features v${version} が公開されています。変換・検証の対応後に SUPPORTED_MAJOR を更新してください。それまで前回データで表示を継続します。`,
      dedupeKey: `browser-support:alert:major:v${String(major)}`,
    });
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
      await notify({
        kind: 'alert',
        title: 'Browser Support同期: 上流リリースが停滞',
        body: `web-features が ${String(UPSTREAM_STALE_DAYS)} 日以上更新されていません(現行 v${version})。上流の動向を確認してください。`,
        dedupeKey: `browser-support:alert:stale:v${version}`,
      });
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
      await notify({
        kind: 'alert',
        title: 'Browser Support同期: 上流フォーマットの破壊的変化',
        body: `v${version} の変換に失敗しました: ${error.message}`,
        dedupeKey: `browser-support:alert:format:v${version}`,
      });
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
    await notify({
      kind: 'alert',
      title: 'Browser Support同期: 検証で拒否',
      body: `v${version}: ${detail}`,
      dedupeKey: `browser-support:alert:invariant:v${version}`,
    });
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

  // 7. 世代置換
  try {
    await applyDataset(dataset);
  } catch (error) {
    return finish({
      result: 'db_failed',
      upstreamVersion: version,
      detail: String(error),
    });
  }

  // 8. 通知。dedupeKey はバージョン単位: 手動再同期やトリガー多重化があっても
  // 同一バージョンの更新通知は1回だけになる。初回取り込みは全件が「新規」に
  // なってしまうため通知しない。
  if (diff !== null) {
    const hasChanges = diff.reached.length > 0 || diff.statusChanges.length > 0;
    if (hasChanges) {
      await notify({
        kind: 'update',
        title: 'Browser Support更新',
        body: buildUpdateBody(diff),
        dedupeKey: `browser-support:v${version}`,
      });
    }
    if (
      minVersionsChanged(active?.dataset.minVersions ?? {}, dataset.minVersions)
    ) {
      // RootLayout のフロアはリポジトリにコミットした生成物で、自動では追従しない。
      await notify({
        kind: 'alert',
        title: 'Browser Support: 最低対応バージョンが変化',
        body: `v${version} でブラウザ最低版フロアが変わりました。apps/main で pnpm run generate:browser-min-versions を実行してコミットしてください。`,
        dedupeKey: `browser-support:alert:min-versions:v${version}`,
      });
    }
  }
  if (warnings.length > 0) {
    await notify({
      kind: 'alert',
      title: 'Browser Support同期: 警告',
      body: `v${version}: ${warnings.join(' / ')}`,
      dedupeKey: `browser-support:alert:warning:v${version}`,
    });
  }

  // 9. main の表示キャッシュを再検証(失敗しても同期自体は成功扱い)
  await revalidateMainCache(BROWSER_SUPPORT_CACHE_TAG);

  return finish({
    result: 'applied',
    upstreamVersion: version,
    detail:
      skippedFeatures.length > 0
        ? `skipped: ${String(skippedFeatures.length)}件`
        : null,
    newlyCount: diff?.reached.filter((f) => f.status === 'newly').length ?? 0,
    widelyCount: diff?.reached.filter((f) => f.status === 'widely').length ?? 0,
    statusChangeCount: diff?.statusChanges.length ?? 0,
  });
}
