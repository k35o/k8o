import { db } from '@repo/database';
import type {
  BrowserSupportChangeStatus,
  BrowserSupportSyncResult,
  BrowserSupportSyncTrigger,
} from '@repo/database/schema';
import { parseBaselineDataset } from '@repo/helpers/baseline/model';
import type { BaselineDataset } from '@repo/helpers/baseline/model';
import { and, desc, eq, lt, notInArray } from 'drizzle-orm';

export type ActiveDatasetRecord = {
  id: number;
  upstreamVersion: string;
  ingestedAt: string;
  dataset: BaselineDataset;
};

// ロールバックに備えて superseded を直近何世代残すか。可用性のためではない
// (DB 障害時は superseded も読めない)ので、少数でよい。
const KEEP_SUPERSEDED = 3;

// 変更履歴の保持期間。main の表示窓(30日)より十分長く取り、それより古い行は
// 世代置換のたびに削る。
const CHANGE_RETENTION_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

export type FeatureChangeInput = {
  featureId: string;
  featureName: string;
  status: BrowserSupportChangeStatus;
  // null は baseline(newly/widely)への新規到達、非 null は baseline 内の遷移
  previousStatus: BrowserSupportChangeStatus | null;
};

export const findActiveDataset =
  async (): Promise<ActiveDatasetRecord | null> => {
    const rows = await db
      .select({
        id: db._schema.browserSupportDatasets.id,
        upstreamVersion: db._schema.browserSupportDatasets.upstreamVersion,
        ingestedAt: db._schema.browserSupportDatasets.ingestedAt,
        data: db._schema.browserSupportDatasets.data,
      })
      .from(db._schema.browserSupportDatasets)
      .where(eq(db._schema.browserSupportDatasets.state, 'active'))
      .orderBy(desc(db._schema.browserSupportDatasets.id))
      .limit(1);
    const row = rows[0];
    if (row === undefined) {
      return null;
    }
    // 自分が書いたデータでも読み時に検証する。壊れた active は「データ無し」に落とし、
    // 表示エラーではなく再同期で回復できる状態にする。
    const dataset = parseBaselineDataset(row.data);
    if (dataset === null) {
      return null;
    }
    return {
      id: row.id,
      upstreamVersion: row.upstreamVersion,
      ingestedAt: row.ingestedAt,
      dataset,
    };
  };

// 世代の置換。libSQL HTTP ドライバの interactive transaction は往復ごとにロックを
// 保持しタイムアウトしやすいため、単一リクエストの db.batch(暗黙トランザクション)で
// アトミックに行う。ブロブ方式なので文数はデータ量に依らず定数。
export const applyDataset = async (
  dataset: BaselineDataset,
  changes: FeatureChangeInput[],
): Promise<void> => {
  const datasets = db._schema.browserSupportDatasets;
  const featureChanges = db._schema.browserSupportFeatureChanges;
  // 同一バッチの全行に同じ時刻を刻む。main はこの時刻で同期単位のグループ表示をする。
  const changedAt = new Date().toISOString();
  await db.batch([
    // 手動の強制再同期(同一バージョン)は既存行を消してから入れ直す
    db
      .delete(datasets)
      .where(eq(datasets.upstreamVersion, dataset.upstreamVersion)),
    db
      .update(datasets)
      .set({ state: 'superseded' })
      .where(eq(datasets.state, 'active')),
    db.insert(datasets).values({
      upstreamVersion: dataset.upstreamVersion,
      state: 'active',
      data: dataset,
    }),
    db
      .delete(datasets)
      .where(
        and(
          eq(datasets.state, 'superseded'),
          notInArray(
            datasets.id,
            db
              .select({ id: datasets.id })
              .from(datasets)
              .where(eq(datasets.state, 'superseded'))
              .orderBy(desc(datasets.id))
              .limit(KEEP_SUPERSEDED),
          ),
        ),
      ),
    db
      .delete(featureChanges)
      .where(
        lt(
          featureChanges.changedAt,
          new Date(Date.now() - CHANGE_RETENTION_DAYS * DAY_MS).toISOString(),
        ),
      ),
    ...(changes.length > 0
      ? [
          db.insert(featureChanges).values(
            changes.map((change) => ({
              ...change,
              upstreamVersion: dataset.upstreamVersion,
              changedAt,
            })),
          ),
        ]
      : []),
  ]);
};

export type SyncRunRecord = {
  id: number;
  trigger: BrowserSupportSyncTrigger;
  result: BrowserSupportSyncResult;
  upstreamVersion: string | null;
  detail: string | null;
  durationMs: number | null;
  createdAt: string;
};

export const recordSyncRun = async (run: {
  trigger: BrowserSupportSyncTrigger;
  result: BrowserSupportSyncResult;
  upstreamVersion: string | null;
  detail: string | null;
  durationMs: number;
}): Promise<void> => {
  await db.insert(db._schema.browserSupportSyncRuns).values(run);
};

export const findRecentSyncRuns = (limit: number): Promise<SyncRunRecord[]> =>
  db
    .select()
    .from(db._schema.browserSupportSyncRuns)
    .orderBy(desc(db._schema.browserSupportSyncRuns.id))
    .limit(limit);
