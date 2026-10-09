import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { countBlogView } from '../application/count-view';

const slugParamSchema = z.object({
  slug: z.string().check(z.minLength(1), z.maxLength(200)),
});

export const blogPublicRoutes = new Hono().post(
  '/:slug/views',
  validator('param', (value, c) => {
    const parsed = slugParamSchema.safeParse(value);
    return parsed.success
      ? parsed.data
      : c.json({ ok: false, error: 'invalid_request' } as const, 400);
  }),
  async (c) => {
    const result = await countBlogView(c.req.valid('param').slug);
    if (result === 'not_found') {
      return c.json({ ok: false, error: 'not_found' } as const, 404);
    }
    return c.body(null, 204);
  },
);
