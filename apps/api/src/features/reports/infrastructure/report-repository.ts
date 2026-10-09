import { db } from '@repo/database';
import { count, desc, eq } from '@repo/database/orm';

type ReportRecord = {
  id: number;
  type: string;
  url: string;
  body: unknown;
  createdAt: string;
};

type ReportTypeCount = {
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

export const findReports = ({
  type,
  page,
  pageSize,
}: {
  type: string | undefined;
  page: number;
  pageSize: number;
}): Promise<ReportRecord[]> =>
  db
    .select({
      id: db._schema.reportingReports.id,
      type: db._schema.reportingReports.type,
      url: db._schema.reportingReports.url,
      body: db._schema.reportingReports.body,
      createdAt: db._schema.reportingReports.createdAt,
    })
    .from(db._schema.reportingReports)
    .where(
      type === undefined
        ? undefined
        : eq(db._schema.reportingReports.type, type),
    )
    .orderBy(
      desc(db._schema.reportingReports.createdAt),
      desc(db._schema.reportingReports.id),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);
