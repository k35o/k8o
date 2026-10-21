import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { listInquiries } from '../application/list-inquiries';

const listQuerySchema = z.object({
  page: z.coerce.number().check(z.int(), z.minimum(1)),
  pageSize: z.coerce.number().check(z.int(), z.minimum(1), z.maximum(50)),
});

export const inquiryOwnerRoutes = new Hono().get(
  '/',
  validator('query', (value, c) => {
    const parsed = listQuerySchema.safeParse(value);
    return parsed.success
      ? parsed.data
      : c.json({ ok: false, error: 'invalid_request' } as const, 400);
  }),
  async (c) => c.json(await listInquiries(c.req.valid('query')), 200),
);
