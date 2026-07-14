import { db } from '@repo/database';
import { and, count, desc, eq, like } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

type ReportRecord = {
  id: number;
  type: string;
  url: string;
  body: unknown;
  createdAt: string;
};

export type ReportTypeCount = {
  type: string;
  count: number;
};

export type FindReportsParams = {
  type?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type FindReportsResult = {
  items: ReportRecord[];
  total: number;
};

export const findReportTypeCounts = async (): Promise<{
  typeCounts: ReportTypeCount[];
  totalCount: number;
}> => {
  const typeCounts = await db
    .select({
      type: db._schema.reportingReports.type,
      count: count(),
    })
    .from(db._schema.reportingReports)
    .groupBy(db._schema.reportingReports.type);

  const totalCount = typeCounts.reduce((sum, t) => sum + t.count, 0);
  return { typeCounts, totalCount };
};

export const findReports = async ({
  type,
  q,
  page = 1,
  pageSize = 20,
}: FindReportsParams = {}): Promise<FindReportsResult> => {
  const conditions: SQL[] = [];
  if (type !== undefined && type !== '') {
    conditions.push(eq(db._schema.reportingReports.type, type));
  }
  if (q !== undefined && q !== '') {
    conditions.push(like(db._schema.reportingReports.url, `%${q}%`));
  }
  const where = conditions.length === 0 ? undefined : and(...conditions);

  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.reportingReports)
    .where(where);
  const total = totalRow[0]?.value ?? 0;

  const items = await db
    .select({
      id: db._schema.reportingReports.id,
      type: db._schema.reportingReports.type,
      url: db._schema.reportingReports.url,
      body: db._schema.reportingReports.body,
      createdAt: db._schema.reportingReports.createdAt,
    })
    .from(db._schema.reportingReports)
    .where(where)
    .orderBy(desc(db._schema.reportingReports.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total };
};
