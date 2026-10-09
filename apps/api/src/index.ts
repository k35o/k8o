import { originValidationResponse } from '@modelcontextprotocol/server';
import { Hono } from 'hono';

import { browserSupportCronRoutes } from './features/browser-support/interface/cron-routes';
import { readingListCronRoutes } from './features/reading-list/interface/cron-routes';
import { mcpHandler } from './mcp';
import { requireBearerSecret } from './shared/auth/require-bearer-secret';

const app = new Hono()
  .use('/cron/*', requireBearerSecret('CRON_SECRET'))
  .use('/mcp', requireBearerSecret('MCP_TOKEN'))
  .route('/cron/sync-articles', readingListCronRoutes)
  .route('/cron/sync-browser-support', browserSupportCronRoutes)
  // MCP 仕様が Origin の検証を求めるが SDK のハンドラは自前で検証しないため、前段で
  // ブラウザからの呼び出し（Origin 付き）を拒否する。Claude Code は Origin を送らない
  .all(
    '/mcp',
    (c) =>
      originValidationResponse(c.req.raw, []) ?? mcpHandler.fetch(c.req.raw),
  );

export default app;
