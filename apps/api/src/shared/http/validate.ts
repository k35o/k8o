import type { ValidationTargets } from 'hono';
import { validator } from 'hono/validator';
import type * as z from 'zod/mini';

// 形の誤りは、どこが違うかを返さずに 400 の invalid_request にする
export const validate = <
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- 戻り値の型が Target で決まり、hc で呼ぶ側はその target の入力だけを求める。外すとすべての target を求める
  Target extends keyof ValidationTargets,
  Schema extends z.ZodMiniType,
>(
  target: Target,
  schema: Schema,
) =>
  validator(target, (value, c) => {
    const parsed = schema.safeParse(value);
    return parsed.success
      ? parsed.data
      : c.json({ ok: false, error: 'invalid_request' } as const, 400);
  });
