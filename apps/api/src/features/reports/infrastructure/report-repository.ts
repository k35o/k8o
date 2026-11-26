import { db } from '@repo/database';
import { count, desc, eq } from '@repo/database/orm';

type ReportRecord = {
  id: number;
  type: string;
  url: string;
  body: unknown;
  createdAt: string;
};

type FindReportsResult = {
  items: ReportRecord[];
  total: number;
};

type ReportInput = {
  type: string;
  url: string;
  body: Record<string, unknown>;
};

export type ReportTypeCount = {
  type: string;
  count: number;
};

// type は送信者が自由に決められるので、種類が増えても返す件数を抑える
const TYPE_COUNT_LIMIT = 20;

export const findReportTypeCounts = (): Promise<ReportTypeCount[]> =>
  db
    .select({ type: db._schema.reportingReports.type, count: count() })
    .from(db._schema.reportingReports)
    .groupBy(db._schema.reportingReports.type)
    .orderBy(desc(count()))
    .limit(TYPE_COUNT_LIMIT);

export const findReports = async ({
  type,
  page,
  pageSize,
}: {
  type: string | undefined;
  page: number;
  pageSize: number;
}): Promise<FindReportsResult> => {
  const reports = db._schema.reportingReports;
  const where = type === undefined ? undefined : eq(reports.type, type);
  const [totalRow, items] = await Promise.all([
    db.select({ value: count() }).from(reports).where(where),
    db
      .select({
        id: reports.id,
        type: reports.type,
        url: reports.url,
        body: reports.body,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(where)
      .orderBy(desc(reports.createdAt), desc(reports.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
  ]);
  return { items, total: totalRow[0]?.value ?? 0 };
};

export const insertReports = async (reports: ReportInput[]): Promise<void> => {
  if (reports.length === 0) {
    return;
  }
  await db.insert(db._schema.reportingReports).values(reports);
};
