import { db } from '@repo/database';

export type BaselineFeature = {
  featureId: string;
  name: string;
  status: 'newly' | 'widely';
  date: string;
};

export async function getBaselineFeatures(): Promise<BaselineFeature[]> {
  const snapshots = await db.query.baselineSnapshots.findMany();

  return snapshots
    .map((s) => ({
      featureId: s.featureId,
      name: s.name,
      status: s.status as 'newly' | 'widely',
      date: s.date,
    }))
    .toSorted((a, b) => b.date.localeCompare(a.date));
}
