import { Hono } from 'hono';
import * as z from 'zod/mini';

import { validate } from '../../../shared/http/validate';
import {
  INQUIRY_PAGE_SIZE_MAX,
  listInquiries,
} from '../application/list-inquiries';

const listQuerySchema = z.object({
  page: z.coerce.number().check(z.int(), z.minimum(1)),
  pageSize: z.coerce
    .number()
    .check(z.int(), z.minimum(1), z.maximum(INQUIRY_PAGE_SIZE_MAX)),
});

export const inquiryOwnerRoutes = new Hono().get(
  '/',
  validate('query', listQuerySchema),
  async (c) => c.json(await listInquiries(c.req.valid('query')), 200),
);
