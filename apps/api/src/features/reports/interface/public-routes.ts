import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { insertReports } from '../infrastructure/report-repository';

// ブラウザの Reporting API が application/reports+json で送る形。main のクライアントの
// エラーも同じ形で送る
const reportsSchema = z.array(
  z.object({
    type: z.string(),
    age: z.number(),
    url: z.string(),
    user_agent: z.string(),
    body: z.record(z.string(), z.unknown()),
  }),
);

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
      c.req.valid('json').map(({ type, url, body }) => ({ type, url, body })),
    );
    return c.body(null, 204);
  },
);
