import { db } from '@repo/database';
import { and, count, desc, eq, like } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export type SnapshotStatus = 'newly' | 'widely';

export type SnapshotRecord = {
  id: number;
  featureId: string;
  name: string;
  status: SnapshotStatus;
  date: string;
};

export type FindSnapshotsParams = {
  status?: SnapshotStatus | 'all';
  q?: string;
  page?: number;
  pageSize?: number;
};

export type FindSnapshotsResult = {
  items: SnapshotRecord[];
  total: number;
};

export const fetchSnapshotStats = async () => {
  const [statusCounts, totalCount] = await Promise.all([
    db
      .select({
        status: db._schema.browserSupportSnapshots.status,
        count: count(),
      })
      .from(db._schema.browserSupportSnapshots)
      .groupBy(db._schema.browserSupportSnapshots.status),
    db.select({ count: count() }).from(db._schema.browserSupportSnapshots),
  ]);

  return {
    newlyCount: statusCounts.find((s) => s.status === 'newly')?.count ?? 0,
    widelyCount: statusCounts.find((s) => s.status === 'widely')?.count ?? 0,
    total: totalCount[0]?.count ?? 0,
  };
};

export const findSnapshots = async ({
  status = 'all',
  q,
  page = 1,
  pageSize = 20,
}: FindSnapshotsParams = {}): Promise<FindSnapshotsResult> => {
  const conditions: SQL[] = [];
  if (status === 'newly' || status === 'widely') {
    conditions.push(eq(db._schema.browserSupportSnapshots.status, status));
  }
  if (q !== undefined && q !== '') {
    conditions.push(like(db._schema.browserSupportSnapshots.name, `%${q}%`));
  }
  const where = conditions.length === 0 ? undefined : and(...conditions);

  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.browserSupportSnapshots)
    .where(where);
  const total = totalRow[0]?.value ?? 0;

  const items = await db
    .select({
      id: db._schema.browserSupportSnapshots.id,
      featureId: db._schema.browserSupportSnapshots.featureId,
      name: db._schema.browserSupportSnapshots.name,
      status: db._schema.browserSupportSnapshots.status,
      date: db._schema.browserSupportSnapshots.date,
    })
    .from(db._schema.browserSupportSnapshots)
    .where(where)
    // date は YYYY-MM-DD で重複が多いため、一意な id を tiebreaker に足して
    // ページ境界での行の重複・欠落を防ぐ。
    .orderBy(
      desc(db._schema.browserSupportSnapshots.date),
      desc(db._schema.browserSupportSnapshots.id),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total };
};
