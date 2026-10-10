import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { insertInquiry } from '../infrastructure/inquiry-repository';

const inquirySchema = z.object({
  message: z.string().check(z.minLength(1), z.maxLength(255)),
});

export const inquiryPublicRoutes = new Hono().post(
  '/',
  validator('json', (value, c) => {
    const parsed = inquirySchema.safeParse(value);
    return parsed.success
      ? parsed.data
      : c.json({ ok: false, error: 'invalid_request' } as const, 400);
  }),
  async (c) => {
    await insertInquiry(c.req.valid('json').message);
    return c.body(null, 204);
  },
);
