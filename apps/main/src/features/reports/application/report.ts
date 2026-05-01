import { db } from '@repo/database';

type ReportInput = {
  type: string;
  url: string;
  body: Record<string, unknown>;
};

export const createReports = async (reports: ReportInput[]): Promise<void> => {
  if (reports.length === 0) {
    return;
  }

  await db.insert(db._schema.reportingReports).values(reports);
};
