import { Hono } from 'hono';
import * as z from 'zod/mini';

import {
  pageQuery,
  pageSizeQuery,
} from '../../../shared/http/pagination-query';
import { validate } from '../../../shared/http/validate';
import {
  INQUIRY_PAGE_SIZE_MAX,
  listInquiries,
} from '../application/list-inquiries';

const listQuerySchema = z.object({
  page: pageQuery,
  pageSize: pageSizeQuery(INQUIRY_PAGE_SIZE_MAX),
});

export const inquiryOwnerRoutes = new Hono().get(
  '/',
  validate('query', listQuerySchema),
  async (c) => c.json(await listInquiries(c.req.valid('query')), 200),
);
