import { Hono } from 'hono';
import * as z from 'zod/mini';

import {
  pageQuery,
  pageSizeQuery,
} from '../../../shared/http/pagination-query';
import { validate } from '../../../shared/http/validate';
import { listReports, REPORT_PAGE_SIZE_MAX } from '../application/list-reports';

const listQuerySchema = z.object({
  type: z.optional(z.string().check(z.minLength(1))),
  page: pageQuery,
  pageSize: pageSizeQuery(REPORT_PAGE_SIZE_MAX),
});

export const reportOwnerRoutes = new Hono().get(
  '/',
  validate('query', listQuerySchema),
  async (c) => {
    const { type, page, pageSize } = c.req.valid('query');
    return c.json(await listReports({ type, page, pageSize }), 200);
  },
);
