import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { listReports } from '../application/list-reports';

const listQuerySchema = z.object({
  type: z.optional(z.string().check(z.minLength(1))),
  page: z.coerce.number().check(z.int(), z.minimum(1)),
  pageSize: z.coerce.number().check(z.int(), z.minimum(1), z.maximum(20)),
});

export const reportOwnerRoutes = new Hono().get(
  '/',
  validator('query', (value, c) => {
    const parsed = listQuerySchema.safeParse(value);
    return parsed.success
      ? parsed.data
      : c.json({ ok: false, error: 'invalid_request' } as const, 400);
  }),
  async (c) => {
    const { type, page, pageSize } = c.req.valid('query');
    return c.json(await listReports({ type, page, pageSize }), 200);
  },
);
