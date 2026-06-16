import { cacheLife } from 'next/cache';

import {
  type FindReportsParams,
  type FindReportsResult,
  findReports,
  findReportTypeCounts,
  type ReportTypeCount,
} from '../infrastructure/report-repository';

export const getReportTypeCounts = async (): Promise<{
  typeCounts: ReportTypeCount[];
  totalCount: number;
}> => {
  'use cache';
  cacheLife('minutes');

  const result = await findReportTypeCounts();
  return result;
};

export const getReports = async (
  params: FindReportsParams,
): Promise<FindReportsResult> => {
  'use cache';
  cacheLife('minutes');

  const result = await findReports(params);
  return result;
};

export type { ReportTypeCount } from '../infrastructure/report-repository';
