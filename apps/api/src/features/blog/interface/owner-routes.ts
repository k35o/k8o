import { Hono } from 'hono';
import * as z from 'zod/mini';

import {
  pageQuery,
  pageSizeQuery,
} from '../../../shared/http/pagination-query';
import { validate } from '../../../shared/http/validate';
import { BLOG_SLUG_PATTERN } from '../application/blog-slug';
import {
  BLOG_SORTS,
  BLOG_STATS_PAGE_SIZE_MAX,
  BLOG_STATUSES,
} from '../application/blog-stats';
import { listBlogStats } from '../application/list-blog-stats';
import {
  getPublishedBlogMarkdown,
  listPublishedBlogs,
} from '../application/published-blogs';

const slugParamSchema = z.object({
  slug: z.string().check(z.regex(BLOG_SLUG_PATTERN)),
});

const statsQuerySchema = z.object({
  status: z.enum(BLOG_STATUSES),
  sort: z.enum(BLOG_SORTS),
  page: pageQuery,
  pageSize: pageSizeQuery(BLOG_STATS_PAGE_SIZE_MAX),
});

export const blogOwnerRoutes = new Hono()
  .get('/', async (c) => c.json({ items: await listPublishedBlogs() }, 200))
  .get('/:slug', validate('param', slugParamSchema), async (c) => {
    const { slug } = c.req.valid('param');
    const markdown = await getPublishedBlogMarkdown(slug);
    if (markdown === null) {
      return c.json({ ok: false, error: 'not_found' } as const, 404);
    }
    return c.json({ slug, markdown }, 200);
  });

export const blogStatsOwnerRoutes = new Hono().get(
  '/',
  validate('query', statsQuerySchema),
  async (c) => c.json(await listBlogStats(c.req.valid('query')), 200),
);
