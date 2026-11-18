import { Hono } from 'hono';

import {
  blogOwnerRoutes,
  blogStatsOwnerRoutes,
} from './features/blog/interface/owner-routes';
import { inquiryOwnerRoutes } from './features/inquiries/interface/owner-routes';
import { overviewOwnerRoutes } from './features/overview/interface/owner-routes';
import { reportOwnerRoutes } from './features/reports/interface/owner-routes';
import { createErrorHandler } from './shared/http/error-handler';

export const ownerRoutes = new Hono()
  .basePath('/owner')
  .route('/blogs', blogOwnerRoutes)
  .route('/overview', overviewOwnerRoutes)
  .route('/inquiries', inquiryOwnerRoutes)
  // /blogs/stats にすると、/blogs/:slug の stats という slug の記事に届かなくなる
  .route('/blog-stats', blogStatsOwnerRoutes)
  .route('/reports', reportOwnerRoutes)
  .onError(createErrorHandler('オーナー API'));

export type OwnerApi = typeof ownerRoutes;
