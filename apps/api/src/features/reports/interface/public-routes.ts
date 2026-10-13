import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { insertReports } from '../infrastructure/report-repository';

const MAX_REPORTS_PER_REQUEST = 50;
const MAX_TYPE_LENGTH = 64;
const MAX_URL_LENGTH = 2048;
const MAX_USER_AGENT_LENGTH = 512;
const MAX_BODY_JSON_LENGTH = 8192;

// ブラウザの Reporting API が application/reports+json で送る形。main のクライアントの
// エラーも同じ形で送る
const reportSchema = z.object({
  type: z.string(),
  age: z.number(),
  url: z.string(),
  user_agent: z.string(),
  body: z.record(z.string(), z.unknown()),
});
const reportsSchema = z.array(reportSchema);

// 上限はスキーマで 400 にせず、超えたレポートだけを捨てる。ブラウザは 2xx 以外を
// 送り直し、410 では送り先を消すため
const isWithinLimits = (report: z.infer<typeof reportSchema>): boolean =>
  report.type.length <= MAX_TYPE_LENGTH &&
  report.url.length <= MAX_URL_LENGTH &&
  report.user_agent.length <= MAX_USER_AGENT_LENGTH &&
  JSON.stringify(report.body).length <= MAX_BODY_JSON_LENGTH;

export const reportPublicRoutes = new Hono().post(
  '/',
  validator('json', (value, c) => {
    const parsed = reportsSchema.safeParse(value);
    return parsed.success
      ? parsed.data
      : c.json({ ok: false, error: 'invalid_request' } as const, 400);
  }),
  async (c) => {
    await insertReports(
      c.req
        .valid('json')
        .filter((report) => isWithinLimits(report))
        .slice(0, MAX_REPORTS_PER_REQUEST)
        .map(({ type, url, body }) => ({ type, url, body })),
    );
    return c.body(null, 204);
  },
);
