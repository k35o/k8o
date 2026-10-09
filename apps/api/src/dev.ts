import { serve } from '@hono/node-server';

import app from './index';

// Vercel が Hono の入口として探す app・index・server とは別の名前にして、本番に混ぜない
serve({
  fetch: app.fetch,
  port: Number(process.env['PORT']),
  hostname: '127.0.0.1',
});
