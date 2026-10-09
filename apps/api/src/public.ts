import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';

import { blogPublicRoutes } from './features/blog/interface/public-routes';

const ALLOWED_ORIGINS = new Set(['https://k8o.me', 'https://www.k8o.me']);
// ローカルの main（portless。worktree ではブランチ名が前に付き、ポートも付く）
const LOCAL_MAIN_ORIGIN =
  /^https:\/\/(?:[a-z0-9-]+\.)?main\.k8o\.localhost(?::\d+)?$/u;

// NODE_ENV はリクエストごとに読む。dev サーバーだけが development で起動する
const isAllowedOrigin = (origin: string): boolean =>
  ALLOWED_ORIGINS.has(origin) ||
  (process.env['NODE_ENV'] === 'development' && LOCAL_MAIN_ORIGIN.test(origin));
const MAX_BODY_BYTES = 64 * 1024;

// k8o.me のブラウザから直接呼ぶ匿名の書き込み。cors は許可しない Origin を拒否しないので、
// フォームと同じ扱いになる POST（本文なしを含む）は csrf で止め、JSON はブラウザの
// プリフライトで止める
export const publicRoutes = new Hono()
  .basePath('/public')
  .use(
    cors({
      origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
      allowMethods: ['POST'],
      allowHeaders: ['Content-Type'],
      maxAge: 7200,
    }),
  )
  .use(csrf({ origin: isAllowedOrigin }))
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
