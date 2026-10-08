import { Hono } from 'hono';

import { runArticleSync } from './sync';

export const readingListCronRoutes = new Hono().get('/', async (c) => {
  const summary = await runArticleSync();
  return c.json({ ok: summary.failedSources.length === 0, ...summary }, 200);
});
