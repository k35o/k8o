import { db } from '@repo/database';
import { parseBaselineDataset } from '@repo/helpers/baseline/model';
import type { BaselineDataset } from '@repo/helpers/baseline/model';
import { desc, eq } from 'drizzle-orm';

export type ActiveBaselineDataset = {
  upstreamVersion: string;
  ingestedAt: string;
  dataset: BaselineDataset;
};

export const findActiveBaselineDataset =
  async (): Promise<ActiveBaselineDataset | null> => {
    let rows;
    try {
      rows = await db
        .select({
          upstreamVersion: db._schema.browserSupportDatasets.upstreamVersion,
          ingestedAt: db._schema.browserSupportDatasets.ingestedAt,
          data: db._schema.browserSupportDatasets.data,
        })
        .from(db._schema.browserSupportDatasets)
        .where(eq(db._schema.browserSupportDatasets.state, 'active'))
        .orderBy(desc(db._schema.browserSupportDatasets.id))
        .limit(1);
    } catch (error) {
      // DB 障害は「データ無し=空状態表示」に減衰させる(stale-but-correct)。throw を
      // 伝播させると /browser-support だけでなく <BrowserSupportStatus> を埋め込んだ
      // ブログ記事まで error boundary に落ちる。マイグレーション未適用環境のビルドも
      // この減衰で成立する。
      console.error(
        'browser-support データセットの読み取りに失敗しました:',
        error,
      );
      return null;
    }
    const row = rows[0];
    if (row === undefined) {
      return null;
    }
    // 壊れた active は「データ無し」に落とす。表示は空状態になり、復旧は admin の
    // 強制再同期で行う(表示エラーには昇格させない)。
    const dataset = parseBaselineDataset(row.data);
    if (dataset === null) {
      return null;
    }
    return {
      upstreamVersion: row.upstreamVersion,
      ingestedAt: row.ingestedAt,
      dataset,
    };
  };

export type BrowserSupportHealth = {
  activeVersion: string | null;
  activeIngestedAt: string | null;
  // 「パイプラインが生きている」ことの心拍。noop(変化なし)と skipped_major(v4 対応
  // 待ちの意図的な保留)も成功に含める。データ鮮度の劣化は admin の警報と鮮度フッターが
  // 別途カバーし、ここでは生存だけを見る(鮮度と生存の分離)。
  lastSuccessAt: string | null;
  lastRun: { createdAt: string; result: string; trigger: string } | null;
};

const HEARTBEAT_RESULTS = new Set(['applied', 'noop', 'skipped_major']);

export const fetchBrowserSupportHealth =
  async (): Promise<BrowserSupportHealth> => {
    const [activeRows, runRows] = await Promise.all([
      db
        .select({
          upstreamVersion: db._schema.browserSupportDatasets.upstreamVersion,
          ingestedAt: db._schema.browserSupportDatasets.ingestedAt,
        })
        .from(db._schema.browserSupportDatasets)
        .where(eq(db._schema.browserSupportDatasets.state, 'active'))
        .orderBy(desc(db._schema.browserSupportDatasets.id))
        .limit(1),
      // 最終 run と最終成功 run は直近の run 群から導出する(クエリを増やさない)
      db
        .select({
          createdAt: db._schema.browserSupportSyncRuns.createdAt,
          result: db._schema.browserSupportSyncRuns.result,
          trigger: db._schema.browserSupportSyncRuns.trigger,
        })
        .from(db._schema.browserSupportSyncRuns)
        .orderBy(desc(db._schema.browserSupportSyncRuns.id))
        .limit(20),
    ]);

    return {
      activeVersion: activeRows[0]?.upstreamVersion ?? null,
      activeIngestedAt: activeRows[0]?.ingestedAt ?? null,
      lastSuccessAt:
        runRows.find((run) => HEARTBEAT_RESULTS.has(run.result))?.createdAt ??
        null,
      lastRun: runRows[0] ?? null,
    };
  };
