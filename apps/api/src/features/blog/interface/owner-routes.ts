import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as z from 'zod/mini';

import { findBlogs } from '../infrastructure/blog-repository';
import {
  BLOG_SLUG_PATTERN,
  fetchBlogMarkdown,
  fetchPublishedBlogs,
} from '../infrastructure/main-blog-source';

const slugParamSchema = z.object({
  slug: z.string().check(z.regex(BLOG_SLUG_PATTERN)),
});

const statsQuerySchema = z.object({
  status: z.enum(['all', 'published', 'draft']),
  sort: z.enum(['recent', 'views']),
  page: z.coerce.number().check(z.int(), z.minimum(1)),
  pageSize: z.coerce.number().check(z.int(), z.minimum(1), z.maximum(50)),
});

export const blogOwnerRoutes = new Hono()
  .get('/', async (c) => c.json({ items: await fetchPublishedBlogs() }, 200))
  .get(
    '/:slug',
    validator('param', (value, c) => {
      const parsed = slugParamSchema.safeParse(value);
      return parsed.success
        ? parsed.data
        : c.json({ ok: false, error: 'invalid_request' } as const, 400);
    }),
    async (c) => {
      const { slug } = c.req.valid('param');
      const markdown = await fetchBlogMarkdown(slug);
      if (markdown === null) {
        return c.json({ ok: false, error: 'not_found' } as const, 404);
      }
      return c.json({ slug, markdown }, 200);
    },
  );

export const blogStatsOwnerRoutes = new Hono().get(
  '/',
  validator('query', (value, c) => {
    const parsed = statsQuerySchema.safeParse(value);
    return parsed.success
      ? parsed.data
      : c.json({ ok: false, error: 'invalid_request' } as const, 400);
  }),
  async (c) => c.json(await findBlogs(c.req.valid('query')), 200),
);
