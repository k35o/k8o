import { db } from '@repo/database';
import { and, count, desc, eq, like, type SQL } from 'drizzle-orm';

export type BaselineStatus = 'newly' | 'widely';

export type BaselineSnapshotRecord = {
  id: number;
  featureId: string;
  name: string;
  status: BaselineStatus;
  date: string;
};

export type FindBaselineSnapshotsParams = {
  status?: BaselineStatus | 'all';
  q?: string;
  page?: number;
  pageSize?: number;
};

export type FindBaselineSnapshotsResult = {
  items: BaselineSnapshotRecord[];
  total: number;
};

export const fetchBaselineSnapshotStats = async () => {
  const [statusCounts, totalCount] = await Promise.all([
    db
      .select({
        status: db._schema.baselineSnapshots.status,
        count: count(),
      })
      .from(db._schema.baselineSnapshots)
      .groupBy(db._schema.baselineSnapshots.status),
    db.select({ count: count() }).from(db._schema.baselineSnapshots),
  ]);

  return {
    newlyCount: statusCounts.find((s) => s.status === 'newly')?.count ?? 0,
    widelyCount: statusCounts.find((s) => s.status === 'widely')?.count ?? 0,
    total: totalCount[0]?.count ?? 0,
  };
};

export const findBaselineSnapshots = async ({
  status = 'all',
  q,
  page = 1,
  pageSize = 20,
}: FindBaselineSnapshotsParams = {}): Promise<FindBaselineSnapshotsResult> => {
  const conditions: SQL[] = [];
  if (status === 'newly' || status === 'widely') {
    conditions.push(eq(db._schema.baselineSnapshots.status, status));
  }
  if (q !== undefined && q !== '') {
    conditions.push(like(db._schema.baselineSnapshots.name, `%${q}%`));
  }
  const where = conditions.length === 0 ? undefined : and(...conditions);

  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.baselineSnapshots)
    .where(where);
  const total = totalRow[0]?.value ?? 0;

  const items = await db
    .select({
      id: db._schema.baselineSnapshots.id,
      featureId: db._schema.baselineSnapshots.featureId,
      name: db._schema.baselineSnapshots.name,
      status: db._schema.baselineSnapshots.status,
      date: db._schema.baselineSnapshots.date,
    })
    .from(db._schema.baselineSnapshots)
    .where(where)
    .orderBy(desc(db._schema.baselineSnapshots.date))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total };
};
