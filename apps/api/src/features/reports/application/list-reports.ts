import { toUntrustedText } from '../../../shared/text/untrusted-text';
import {
  findReports,
  findReportTypeCounts,
} from '../infrastructure/report-repository';
import type { ReportTypeCount } from '../infrastructure/report-repository';

// MCP とオーナー API が受ける 1 ページの件数の上限
export const REPORT_PAGE_SIZE_MAX = 20;

// 受信時の上限は 64KB。モデルの文脈を圧迫しないよう、1件あたりの本文を短く切る
const BODY_MAX_LENGTH = 2000;
const SHORT_TEXT_MAX_LENGTH = 500;

type ReportListItem = {
  id: number;
  receivedAt: string;
  type: string;
  url: string;
  untrustedBody: string;
};

type ReportList = {
  typeCounts: ReportTypeCount[];
  total: number;
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
  const [typeCounts, { items, total }] = await Promise.all([
    findReportTypeCounts(),
    findReports({ type, page, pageSize }),
  ]);
  return {
    typeCounts: typeCounts.map((row) => ({
      type: toUntrustedText(row.type, SHORT_TEXT_MAX_LENGTH),
      count: row.count,
    })),
    total,
    items: items.map((report) => ({
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
