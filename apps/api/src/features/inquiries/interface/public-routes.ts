import { Hono } from 'hono';
import * as z from 'zod/mini';

import { validate } from '../../../shared/http/validate';
import { insertInquiry } from '../infrastructure/inquiry-repository';

const inquirySchema = z.object({
  message: z.string().check(z.minLength(1), z.maxLength(255)),
});

export const inquiryPublicRoutes = new Hono().post(
  '/',
  validate('json', inquirySchema),
  async (c) => {
    await insertInquiry(c.req.valid('json').message);
    return c.body(null, 204);
  },
);
