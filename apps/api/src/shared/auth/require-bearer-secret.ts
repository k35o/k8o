import { isAuthorizedBearerRequest } from '@repo/helpers/is-authorized-bearer-request';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

// hono/bearer-auth を使わないのは、Authorization の形が崩れていても 400 ではなく 401 を
// 返すため。secret はテストで差し替えられるよう、リクエストごとに環境変数から読む
export const requireBearerSecret = (...envNames: readonly string[]) =>
  createMiddleware(async (c, next) => {
    const authorized = envNames.some((envName) =>
      isAuthorizedBearerRequest(c.req.raw, process.env[envName]),
    );
    if (!authorized) {
      throw new HTTPException(401, { res: c.json({ ok: false }, 401) });
    }
    await next();
  });
