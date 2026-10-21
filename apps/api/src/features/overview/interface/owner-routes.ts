import { Hono } from 'hono';

import { getOverview } from './get-overview';

export const overviewOwnerRoutes = new Hono().get('/', async (c) =>
  c.json(await getOverview(), 200),
);
