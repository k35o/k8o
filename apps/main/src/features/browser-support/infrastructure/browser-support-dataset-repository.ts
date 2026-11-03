import { db } from '@repo/database';
import { desc, eq } from '@repo/database/orm';
import { parseBaselineDataset } from '@repo/helpers/baseline/model';
import type { BaselineDataset } from '@repo/helpers/baseline/model';

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
    // 壊れた active は「データ無し」に落とす。表示は空状態になり、復旧は api の
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
