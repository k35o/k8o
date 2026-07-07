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
    // date は YYYY-MM-DD で重複が多いため、一意な id を tiebreaker に足して
    // ページ境界での行の重複・欠落を防ぐ。
    .orderBy(
      desc(db._schema.baselineSnapshots.date),
      desc(db._schema.baselineSnapshots.id),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total };
};

export type BrowserSupportRecord = {
  browser: string;
  version: string | null;
  updatedAt: string;
};

export const fetchBrowserSupport = async (): Promise<
  BrowserSupportRecord[]
> => {
  const rows = await db
    .select({
      browser: db._schema.browserSupport.browser,
      version: db._schema.browserSupport.version,
      updatedAt: db._schema.browserSupport.updatedAt,
    })
    .from(db._schema.browserSupport);
  return rows;
};
