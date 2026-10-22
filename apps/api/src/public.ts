import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';

import { blogPublicRoutes } from './features/blog/interface/public-routes';
import { browserSupportPublicRoutes } from './features/browser-support/interface/public-routes';
import { inquiryPublicRoutes } from './features/inquiries/interface/public-routes';
import { pushSubscriptionPublicRoutes } from './features/push-notification/interface/public-routes';
import { reportPublicRoutes } from './features/reports/interface/public-routes';

const ALLOWED_ORIGINS = new Set(['https://k8o.me', 'https://www.k8o.me']);
// ローカルの main（portless。worktree ではブランチ名が前に付き、ポートも付く）
const LOCAL_MAIN_ORIGIN =
  /^https:\/\/(?:[a-z0-9-]+\.)?main\.k8o\.localhost(?::\d+)?$/u;

// NODE_ENV はリクエストごとに読む。dev サーバーだけが development で起動する
const isAllowedOrigin = (origin: string): boolean =>
  ALLOWED_ORIGINS.has(origin) ||
  (process.env['NODE_ENV'] === 'development' && LOCAL_MAIN_ORIGIN.test(origin));
const MAX_BODY_BYTES = 64 * 1024;

const isReadMethod = (method: string): boolean =>
  method === 'GET' || method === 'HEAD';

const writeCors = cors({
  origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
  allowMethods: ['POST', 'DELETE'],
  allowHeaders: ['Content-Type'],
  maxAge: 7200,
});
// 読むのは k8o.me に出ている公開のデータだけなので、GET と HEAD は Origin を問わない。Origin を
// 選ぶ cors を GET にも掛けると、preview の main からの読み取りを拒み、CDN の応答に Vary: Origin が付く
const readCors = cors({ origin: '*' });

// k8o.me のブラウザから直接呼ぶ匿名の書き込みと、公開データの読み取り。cors は許可しない
// Origin を拒否しないので、フォームと同じ扱いになる POST（本文なしを含む）は csrf で止め、
// JSON はブラウザのプリフライトで止める
export const publicRoutes = new Hono()
  .basePath('/public')
  .use((c, next) =>
    isReadMethod(c.req.method) ? readCors(c, next) : writeCors(c, next),
  )
  .use(async (c, next) => {
    const isRead = isReadMethod(c.req.method);
    // CDN は query を含めた URL でキャッシュするので、query を変えるだけでキャッシュを外して
    // DB や GitHub に届かせられる。読み取りの口は query を受けない
    if (isRead && c.req.url.includes('?')) {
      throw new HTTPException(400, {
        res: c.json({ ok: false, error: 'invalid_request' } as const, 400, {
          'Cache-Control': 'no-store',
        }),
      });
    }
    await next();
    // 400・500・未定義のパスの 404 を CDN とブラウザに持たせない
    if (isRead && !c.res.headers.has('Cache-Control')) {
      c.res.headers.set('Cache-Control', 'no-store');
    }
  })
  .use(csrf({ origin: isAllowedOrigin }))
  .use(
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) =>
        c.json({ ok: false, error: 'payload_too_large' } as const, 413),
    }),
  )
  .route('/blogs', blogPublicRoutes)
  .route('/browser-support', browserSupportPublicRoutes)
  .route('/inquiries', inquiryPublicRoutes)
  .route('/push-subscriptions', pushSubscriptionPublicRoutes)
  .route('/reports', reportPublicRoutes)
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    console.error('公開 API の処理に失敗しました:', error);
    return c.json({ ok: false, error: 'internal_error' } as const, 500);
  });

export type PublicApi = typeof publicRoutes;
