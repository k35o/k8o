import { isAuthorizedBearerRequest } from '@repo/helpers/is-authorized-bearer-request';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

// hono/bearer-auth を使わないのは、main の /api/revalidate と同じヘルパーで未設定の
// secret の拒否と定数時間比較を揃え、旧 cron ルートと同じ 401 { ok: false } を返すため
export const requireCronSecret = createMiddleware(async (c, next) => {
  if (!isAuthorizedBearerRequest(c.req.raw, process.env['CRON_SECRET'])) {
    throw new HTTPException(401, { res: c.json({ ok: false }, 401) });
  }
  await next();
});
