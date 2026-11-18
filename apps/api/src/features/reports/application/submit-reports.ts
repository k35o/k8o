import { insertReports } from '../infrastructure/report-repository';

const MAX_REPORTS_PER_REQUEST = 50;
const MAX_TYPE_LENGTH = 64;
const MAX_URL_LENGTH = 2048;
const MAX_USER_AGENT_LENGTH = 512;
const MAX_BODY_JSON_LENGTH = 8192;

type ReceivedReport = {
  type: string;
  url: string;
  user_agent: string;
  body: Record<string, unknown>;
};

const isWithinLimits = (report: ReceivedReport): boolean =>
  report.type.length <= MAX_TYPE_LENGTH &&
  report.url.length <= MAX_URL_LENGTH &&
  report.user_agent.length <= MAX_USER_AGENT_LENGTH &&
  JSON.stringify(report.body).length <= MAX_BODY_JSON_LENGTH;

// 上限を超えたレポートは、要求を拒まずにそれだけを捨てる。ブラウザは 2xx 以外を
// 送り直し、410 では送り先を消すため
export const submitReports = (reports: ReceivedReport[]): Promise<void> =>
  insertReports(
    reports
      .filter((report) => isWithinLimits(report))
      .slice(0, MAX_REPORTS_PER_REQUEST)
      .map(({ type, url, body }) => ({ type, url, body })),
  );
