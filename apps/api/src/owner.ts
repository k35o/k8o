import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { blogOwnerRoutes } from './features/blog/interface/owner-routes';
import { overviewOwnerRoutes } from './features/overview/interface/owner-routes';

export const ownerRoutes = new Hono()
  .basePath('/owner')
  .route('/blogs', blogOwnerRoutes)
  .route('/overview', overviewOwnerRoutes)
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    console.error('オーナー API の処理に失敗しました:', error);
    return c.json({ ok: false, error: 'internal_error' } as const, 500);
  });

export type OwnerApi = typeof ownerRoutes;
