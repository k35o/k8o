import { db } from '@repo/database';
import { eq } from 'drizzle-orm';

import { features } from '../infrastructure/web-features-source';

export type BaselineFeature = {
  featureId: string;
  name: string;
  status: 'newly' | 'widely';
  date: string;
};

export type SyncResult = {
  newFeatures: BaselineFeature[];
  statusChanges: Array<{
    feature: BaselineFeature;
    previousStatus: string;
  }>;
};

// web-features は baseline 到達日が不確かなとき "≤2022-09-24" のように ≤ を前置する。
const normalizeDate = (date: string): string => date.replace(/^≤/u, '');

// web-features から baseline(newly/widely)機能を取り出す。表示は main が web-features を
// 直接読むため、ここは push の差分検知に要る featureId / name / status / date だけを見る。
export const readBaselineFeatures = (): BaselineFeature[] => {
  const result: BaselineFeature[] = [];
  for (const [featureId, feature] of Object.entries(features)) {
    // moved / split は redirect のため除外。feature には status が必ずある。
    if (feature.kind !== 'feature') {
      continue;
    }
    const { baseline } = feature.status;
    if (baseline !== 'high' && baseline !== 'low') {
      continue;
    }
    const rawDate =
      baseline === 'high'
        ? (feature.status.baseline_high_date ??
          feature.status.baseline_low_date)
        : feature.status.baseline_low_date;
    if (rawDate === undefined) {
      continue;
    }
    result.push({
      featureId,
      name: feature.name,
      status: baseline === 'high' ? 'widely' : 'newly',
      date: normalizeDate(rawDate),
    });
  }
  return result;
};

type SnapshotRow = { featureId: string; status: string };

type SyncPlan = SyncResult & {
  toInsert: BaselineFeature[];
  toUpdate: BaselineFeature[];
};

// 現在の baseline 集合と既存スナップショットを突き合わせ、新規機能・status 変化を求める。
export const diffBaseline = (
  current: BaselineFeature[],
  existing: SnapshotRow[],
): SyncPlan => {
  const existingByFeatureId = new Map(existing.map((s) => [s.featureId, s]));
  const newFeatures: BaselineFeature[] = [];
  const statusChanges: SyncResult['statusChanges'] = [];
  const toInsert: BaselineFeature[] = [];
  const toUpdate: BaselineFeature[] = [];

  for (const feature of current) {
    const prev = existingByFeatureId.get(feature.featureId);
    if (!prev) {
      newFeatures.push(feature);
      toInsert.push(feature);
      continue;
    }
    if (prev.status !== feature.status) {
      statusChanges.push({ feature, previousStatus: prev.status });
      toUpdate.push(feature);
    }
  }

  return { newFeatures, statusChanges, toInsert, toUpdate };
};

// baseline_snapshots は「前回 push 済みの状態」を保持する差分の基準。web-features
// パッケージ（デプロイで更新）と突き合わせ、新規機能と status 変化を push に渡す。
export async function syncBaseline(): Promise<SyncResult> {
  const current = readBaselineFeatures();

  const existing = await db
    .select({
      featureId: db._schema.baselineSnapshots.featureId,
      status: db._schema.baselineSnapshots.status,
    })
    .from(db._schema.baselineSnapshots);

  const { newFeatures, statusChanges, toInsert, toUpdate } = diffBaseline(
    current,
    existing,
  );

  if (toInsert.length > 0) {
    await db.insert(db._schema.baselineSnapshots).values(toInsert);
  }

  if (toUpdate.length > 0) {
    await db.transaction((tx) =>
      Promise.all(
        toUpdate.map((item) =>
          tx
            .update(db._schema.baselineSnapshots)
            .set({ status: item.status, date: item.date, name: item.name })
            .where(eq(db._schema.baselineSnapshots.featureId, item.featureId)),
        ),
      ),
    );
  }

  return { newFeatures, statusChanges };
}
