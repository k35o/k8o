import { Hono } from 'hono';

import { browserSupportCronRoutes } from './features/browser-support/interface/cron-routes';
import { readingListCronRoutes } from './features/reading-list/interface/cron-routes';
import { requireCronSecret } from './shared/auth/require-cron-secret';

const app = new Hono()
  .use('/cron/*', requireCronSecret)
  .route('/cron/sync-articles', readingListCronRoutes)
  .route('/cron/sync-browser-support', browserSupportCronRoutes);

export default app;
