import { db } from '@repo/database';
import { count } from 'drizzle-orm';
import { cacheLife } from 'next/cache';

export const getBaselineSnapshotStats = async () => {
  'use cache';
  cacheLife('minutes');

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
