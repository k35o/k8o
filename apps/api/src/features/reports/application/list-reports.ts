import { toUntrustedText } from '../../../shared/text/untrusted-text';
import {
  findReports,
  findReportTypeCounts,
} from '../infrastructure/report-repository';

// 受信時の上限は 64KB。モデルの文脈を圧迫しないよう、1件あたりの本文を短く切る
const BODY_MAX_LENGTH = 2000;
const SHORT_TEXT_MAX_LENGTH = 500;

type ReportTypeCount = {
  type: string;
  count: number;
};

type ReportListItem = {
  id: number;
  receivedAt: string;
  type: string;
  url: string;
  untrustedBody: string;
};

type ReportList = {
  typeCounts: ReportTypeCount[];
  items: ReportListItem[];
};

export const listReports = async ({
  type,
  page,
  pageSize,
}: {
  type: string | undefined;
  page: number;
  pageSize: number;
}): Promise<ReportList> => {
  const [typeCounts, reports] = await Promise.all([
    findReportTypeCounts(),
    findReports({ type, page, pageSize }),
  ]);
  return {
    typeCounts: typeCounts.map((row) => ({
      type: toUntrustedText(row.type, SHORT_TEXT_MAX_LENGTH),
      count: row.count,
    })),
    items: reports.map((report) => ({
      id: report.id,
      receivedAt: report.createdAt,
      type: toUntrustedText(report.type, SHORT_TEXT_MAX_LENGTH),
      url: toUntrustedText(report.url, SHORT_TEXT_MAX_LENGTH),
      untrustedBody: toUntrustedText(
        JSON.stringify(report.body),
        BODY_MAX_LENGTH,
      ),
    })),
  };
};
