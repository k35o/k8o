import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import {
  blogOwnerRoutes,
  blogStatsOwnerRoutes,
} from './features/blog/interface/owner-routes';
import { inquiryOwnerRoutes } from './features/inquiries/interface/owner-routes';
import { overviewOwnerRoutes } from './features/overview/interface/owner-routes';

export const ownerRoutes = new Hono()
  .basePath('/owner')
  .route('/blogs', blogOwnerRoutes)
  .route('/overview', overviewOwnerRoutes)
  .route('/inquiries', inquiryOwnerRoutes)
  // /blogs/stats にすると、/blogs/:slug の stats という slug の記事に届かなくなる
  .route('/blog-stats', blogStatsOwnerRoutes)
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    console.error('オーナー API の処理に失敗しました:', error);
    return c.json({ ok: false, error: 'internal_error' } as const, 500);
  });

export type OwnerApi = typeof ownerRoutes;
