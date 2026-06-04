import { db } from '@repo/database';
import { count, desc } from 'drizzle-orm';

export const fetchReportsOverview = async () => {
  const [reports, typeCounts] = await Promise.all([
    db.query.reportingReports.findMany({
      orderBy: (reportTable) => [desc(reportTable.createdAt)],
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
