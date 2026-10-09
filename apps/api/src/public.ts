import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';

import { blogPublicRoutes } from './features/blog/interface/public-routes';

const ALLOWED_ORIGINS = ['https://k8o.me', 'https://www.k8o.me'];
const MAX_BODY_BYTES = 64 * 1024;

// k8o.me のブラウザから直接呼ぶ匿名の書き込み。cors は許可しない Origin を拒否しないので、
// フォームと同じ扱いになる POST（本文なしを含む）は csrf で止め、JSON はブラウザの
// プリフライトで止める
export const publicRoutes = new Hono()
  .basePath('/public')
  .use(
    cors({
      origin: ALLOWED_ORIGINS,
      allowMethods: ['POST'],
      allowHeaders: ['Content-Type'],
      maxAge: 7200,
    }),
  )
  .use(csrf({ origin: ALLOWED_ORIGINS }))
  .use(
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) =>
        c.json({ ok: false, error: 'payload_too_large' } as const, 413),
    }),
  )
  .route('/blogs', blogPublicRoutes)
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    console.error('公開 API の処理に失敗しました:', error);
    return c.json({ ok: false, error: 'internal_error' } as const, 500);
  });

export type PublicApi = typeof publicRoutes;
