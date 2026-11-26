import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

// hono の csrf（403）と validator の壊れた JSON（400）は本文をテキストにして投げるので、
// ルートが返すエラーと同じ形にそろえる
const textExceptionCode = (
  status: number,
): 'invalid_request' | 'forbidden' | null => {
  if (status === 400) {
    return 'invalid_request';
  }
  return status === 403 ? 'forbidden' : null;
};

export const createErrorHandler =
  (apiName: string): ErrorHandler =>
  (error, c) => {
    if (error instanceof HTTPException) {
      const res = error.getResponse();
      const code = textExceptionCode(error.status);
      return code === null ||
        res.headers.get('Content-Type')?.startsWith('application/json') === true
        ? res
        : c.json({ ok: false, error: code } as const, error.status);
    }
    console.error(`${apiName} の処理に失敗しました:`, error);
    return c.json({ ok: false, error: 'internal_error' } as const, 500);
  };
