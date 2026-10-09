import { isAuthorizedBearerRequest } from '@repo/helpers/is-authorized-bearer-request';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

// hono/bearer-auth を使わないのは、main の /api/revalidate と同じヘルパーで未設定の
// secret の拒否と定数時間比較を揃え、401 { ok: false } を返すため。
// secret はテストで差し替えられるよう、リクエストごとに環境変数から読む
export const requireBearerSecret = (envName: string) =>
  createMiddleware(async (c, next) => {
    if (!isAuthorizedBearerRequest(c.req.raw, process.env[envName])) {
      throw new HTTPException(401, { res: c.json({ ok: false }, 401) });
    }
    await next();
  });
