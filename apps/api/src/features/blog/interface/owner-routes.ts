import { Hono } from 'hono';
import * as z from 'zod/mini';

import { validate } from '../../../shared/http/validate';
import { BLOG_SLUG_PATTERN } from '../application/blog-slug';
import { BLOG_STATS_PAGE_SIZE_MAX } from '../application/blog-stats';
import { findBlogs } from '../infrastructure/blog-repository';
import {
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
  pageSize: z.coerce
    .number()
    .check(z.int(), z.minimum(1), z.maximum(BLOG_STATS_PAGE_SIZE_MAX)),
});

export const blogOwnerRoutes = new Hono()
  .get('/', async (c) => c.json({ items: await fetchPublishedBlogs() }, 200))
  .get('/:slug', validate('param', slugParamSchema), async (c) => {
    const { slug } = c.req.valid('param');
    const markdown = await fetchBlogMarkdown(slug);
    if (markdown === null) {
      return c.json({ ok: false, error: 'not_found' } as const, 404);
    }
    return c.json({ slug, markdown }, 200);
  });

export const blogStatsOwnerRoutes = new Hono().get(
  '/',
  validate('query', statsQuerySchema),
  async (c) => c.json(await findBlogs(c.req.valid('query')), 200),
);
