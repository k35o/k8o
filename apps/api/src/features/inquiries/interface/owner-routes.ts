import { Hono } from 'hono';
import * as z from 'zod/mini';

import { validate } from '../../../shared/http/validate';
import { listInquiries } from '../application/list-inquiries';

const listQuerySchema = z.object({
  page: z.coerce.number().check(z.int(), z.minimum(1)),
  pageSize: z.coerce.number().check(z.int(), z.minimum(1), z.maximum(50)),
});

export const inquiryOwnerRoutes = new Hono().get(
  '/',
  validate('query', listQuerySchema),
  async (c) => c.json(await listInquiries(c.req.valid('query')), 200),
);
