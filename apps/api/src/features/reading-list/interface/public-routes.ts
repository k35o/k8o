import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';

import { publicCacheControl } from '../../../shared/cache/public-cache-control';
import {
  getReadingList,
  getReadingListFeed,
  READING_LIST_FEED_URL,
} from '../application/reading-list';

const CACHE_CONTROL = publicCacheControl({ maxAge: 300, sMaxAge: 3600 });

// 公開の GET は query を 400 にするが、フィードは k8o.me の /reading-list/feed（self）として配り、
// 購読者やリーダーが付けた query でも取れなければならない。400 の前で query の無いその URL へ
// 戻す。戻した先は query を持たないので繰り返さない
export const redirectReadingListFeedQuery = createMiddleware(
  async (c, next) => {
    const isRead = c.req.method === 'GET' || c.req.method === 'HEAD';
    if (isRead && c.req.url.includes('?')) {
      c.header('Cache-Control', CACHE_CONTROL);
      return c.redirect(READING_LIST_FEED_URL, 308);
    }
    return next();
  },
);

export const readingListPublicRoutes = new Hono()
  .get('/', async (c) =>
    c.json(await getReadingList(Date.now()), 200, {
      'Cache-Control': CACHE_CONTROL,
    }),
  )
  .get('/feed', async (c) =>
    c.body(await getReadingListFeed(Date.now()), 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
    }),
  );
