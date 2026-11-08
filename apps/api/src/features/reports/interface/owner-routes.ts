import { Hono } from 'hono';
import * as z from 'zod/mini';

import { validate } from '../../../shared/http/validate';
import { listReports, REPORT_PAGE_SIZE_MAX } from '../application/list-reports';

const listQuerySchema = z.object({
  type: z.optional(z.string().check(z.minLength(1))),
  page: z.coerce.number().check(z.int(), z.minimum(1)),
  pageSize: z.coerce
    .number()
    .check(z.int(), z.minimum(1), z.maximum(REPORT_PAGE_SIZE_MAX)),
});

export const reportOwnerRoutes = new Hono().get(
  '/',
  validate('query', listQuerySchema),
  async (c) => {
    const { type, page, pageSize } = c.req.valid('query');
    return c.json(await listReports({ type, page, pageSize }), 200);
  },
);
