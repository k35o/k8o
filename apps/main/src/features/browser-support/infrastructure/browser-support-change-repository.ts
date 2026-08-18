import { db } from '@repo/database';
import type { BrowserSupportChangeStatus } from '@repo/database/schema';
import { desc, gte } from 'drizzle-orm';

export type BrowserSupportFeatureChange = {
  featureId: string;
  featureName: string;
  status: BrowserSupportChangeStatus;
  // null は baseline(newly/widely)への新規到達、非 null は baseline 内の遷移
  previousStatus: BrowserSupportChangeStatus | null;
  upstreamVersion: string;
  changedAt: string;
};

export const findRecentFeatureChanges = async (
  sinceIso: string,
  limit: number,
): Promise<BrowserSupportFeatureChange[]> => {
  const changes = db._schema.browserSupportFeatureChanges;
  try {
    return await db
      .select({
        featureId: changes.featureId,
        featureName: changes.featureName,
        status: changes.status,
        previousStatus: changes.previousStatus,
        upstreamVersion: changes.upstreamVersion,
        changedAt: changes.changedAt,
      })
      .from(changes)
      .where(gte(changes.changedAt, sinceIso))
      .orderBy(desc(changes.changedAt), desc(changes.id))
      .limit(limit);
  } catch (error) {
    // DB 障害やマイグレーション未適用は「履歴なし=セクション非表示」に減衰させる
    // (dataset 側の findActiveBaselineDataset と同じ方針)。
    console.error('browser-support 変更履歴の読み取りに失敗しました:', error);
    return [];
  }
};
