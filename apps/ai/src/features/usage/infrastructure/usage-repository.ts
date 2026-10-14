import 'server-only';
import { db } from '@repo/ai-database';
import { and, count, eq, gte, lt, sql } from '@repo/ai-database/orm';
import type { AiApp } from '@repo/ai-database/schema';

// 生成1回ごとの利用ログ（ai_usages）。レート制限とコスト把握の基盤。
const usages = db._schema.aiUsages;
const GENERATION_KIND = 'generation';

export type GenerationTokens = {
  inputTokens: number | null;
  outputTokens: number | null;
};

// 数えてから insert すると、同時に来た要求がどれも上限前の件数を見て通ってしまうので、
// 上限の確認と行の予約を1文で行う
export const reserveGenerationUsage = async (input: {
  app: AiApp;
  userId: string;
  createdAt: string;
  sinceIso: string;
  limit: number;
}): Promise<number | null> => {
  const recent = db
    .select({ total: count().as('total') })
    .from(usages)
    .where(
      and(
        eq(usages.userId, input.userId),
        eq(usages.app, input.app),
        eq(usages.kind, GENERATION_KIND),
        gte(usages.createdAt, input.sinceIso),
      ),
    )
    .as('recent');

  const [row] = await db
    .insert(usages)
    .select((qb) =>
      qb
        .select({
          // insert ... select は全列をテーブル定義の順に並べる必要があるので、id には
          // NULL を渡して採番させ、created_at の既定値の代わりに時刻を渡す。
          // 副問い合わせから選ぶ値は、別名を付けないと型が通らない
          id: sql<number>`null`.as('id'),
          app: sql<AiApp>`${input.app}`.as('app'),
          userId: sql<string>`${input.userId}`.as('user_id'),
          kind: sql<string>`${GENERATION_KIND}`.as('kind'),
          model: sql<null>`null`.as('model'),
          inputTokens: sql<null>`null`.as('input_tokens'),
          outputTokens: sql<null>`null`.as('output_tokens'),
          cacheReadTokens: sql<null>`null`.as('cache_read_tokens'),
          cacheWriteTokens: sql<null>`null`.as('cache_write_tokens'),
          costMicroUsd: sql<null>`null`.as('cost_micro_usd'),
          createdAt: sql<string>`${input.createdAt}`.as('created_at'),
        })
        .from(recent)
        .where(lt(recent.total, input.limit)),
    )
    .returning({ id: usages.id });
  return row?.id ?? null;
};

export const updateGenerationUsageTokens = async (
  input: { id: number } & GenerationTokens,
): Promise<void> => {
  await db
    .update(usages)
    .set({ inputTokens: input.inputTokens, outputTokens: input.outputTokens })
    .where(eq(usages.id, input.id));
};
