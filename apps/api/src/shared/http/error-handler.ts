import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const createErrorHandler =
  (apiName: string): ErrorHandler =>
  (error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    console.error(`${apiName} の処理に失敗しました:`, error);
    return c.json({ ok: false, error: 'internal_error' } as const, 500);
  };
