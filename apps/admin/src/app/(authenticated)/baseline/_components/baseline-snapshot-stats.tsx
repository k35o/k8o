import { db } from '@repo/database';
import { count } from 'drizzle-orm';
import { cacheLife } from 'next/cache';

import { StatCard } from '@/app/(authenticated)/_components/stat-card/stat-card';

export const BaselineSnapshotStats = async () => {
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

  const newlyCount = statusCounts.find((s) => s.status === 'newly')?.count ?? 0;
  const widelyCount =
    statusCounts.find((s) => s.status === 'widely')?.count ?? 0;
  const total = totalCount[0]?.count ?? 0;

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard label="Newly Available" value={String(newlyCount)} />
      <StatCard label="Widely Available" value={String(widelyCount)} />
      <StatCard label="合計" value={String(total)} />
    </section>
  );
};
