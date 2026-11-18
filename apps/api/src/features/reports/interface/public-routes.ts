import { Hono } from 'hono';
import * as z from 'zod/mini';

import { validate } from '../../../shared/http/validate';
import { submitReports } from '../application/submit-reports';

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

export const reportPublicRoutes = new Hono().post(
  '/',
  validate('json', reportsSchema),
  async (c) => {
    await submitReports(c.req.valid('json'));
    return c.body(null, 204);
  },
);
