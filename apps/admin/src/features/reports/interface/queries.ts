import { db } from '@repo/database';
import { count, desc } from 'drizzle-orm';
import { cacheLife } from 'next/cache';

export const getReportsOverview = async () => {
  'use cache';
  cacheLife('minutes');

  const [reports, typeCounts] = await Promise.all([
    db.query.reportingReports.findMany({
      orderBy: (reports) => [desc(reports.createdAt)],
      limit: 100,
    }),
    db
      .select({
        type: db._schema.reportingReports.type,
        count: count(),
      })
      .from(db._schema.reportingReports)
      .groupBy(db._schema.reportingReports.type),
  ]);

  const totalCount = typeCounts.reduce((sum, t) => sum + t.count, 0);

  return { reports, typeCounts, totalCount };
};
