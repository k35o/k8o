import { Hono } from 'hono';

import { runArticleSync } from './sync';

export const readingListCronRoutes = new Hono().get('/', async (c) => {
  const summary = await runArticleSync();
  const ok =
    summary.failedSources.length === 0 &&
    !summary.summaryAborted &&
    !summary.digestAborted;
  return c.json({ ok, ...summary }, 200);
});
