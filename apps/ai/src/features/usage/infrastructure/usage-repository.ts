import 'server-only';
import { db } from '@repo/ai-database';
import { and, count, eq, gte, lt, sql } from '@repo/ai-database/orm';
import type { SQL } from '@repo/ai-database/orm';
import type { AiApp, AiUsageKind } from '@repo/ai-database/schema';

import type { GenerationModel } from '@/shared/claude/models';

// 生成1回ごとの利用ログ（ai_usages）。レート制限とコスト把握の基盤。
const usages = db._schema.aiUsages;

// 予約したばかりの行と、費用の列を足す前の行は cost_micro_usd が null なので、0円として数える
const spentMicroUsd = (): SQL<number> =>
  sql<number>`coalesce(sum(${usages.costMicroUsd}), 0)`.mapWith(Number);

// 数えてから insert すると、同時に来た要求がどれも上限前の件数や合計を見て通ってしまうので、
// 上限の確認と行の予約を1文で行う
export const insertUsageWithinLimits = async (input: {
  app: AiApp;
  kind: AiUsageKind;
  userId: string;
  model: GenerationModel;
  createdAt: string;
  sinceIso: string;
  limit: number;
  monthStartIso: string;
  budgetMicroUsd: number;
}): Promise<number | null> => {
  const recent = db
    .select({ total: count().as('total') })
    .from(usages)
    .where(
      and(
        eq(usages.userId, input.userId),
        eq(usages.app, input.app),
        gte(usages.createdAt, input.sinceIso),
      ),
    )
    .as('recent');
  const spent = db
    .select({ spent: spentMicroUsd().as('spent') })
    .from(usages)
    .where(gte(usages.createdAt, input.monthStartIso))
    .as('spent');

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
          kind: sql<AiUsageKind>`${input.kind}`.as('kind'),
          model: sql<string>`${input.model}`.as('model'),
          inputTokens: sql<null>`null`.as('input_tokens'),
          outputTokens: sql<null>`null`.as('output_tokens'),
          cacheReadTokens: sql<null>`null`.as('cache_read_tokens'),
          cacheWriteTokens: sql<null>`null`.as('cache_write_tokens'),
          costMicroUsd: sql<null>`null`.as('cost_micro_usd'),
          createdAt: sql<string>`${input.createdAt}`.as('created_at'),
        })
        .from(recent)
        .crossJoin(spent)
        .where(
          and(
            lt(recent.total, input.limit),
            lt(spent.spent, input.budgetMicroUsd),
          ),
        ),
    )
    .returning({ id: usages.id });
  return row?.id ?? null;
};

export const selectCostSinceMicroUsd = async (
  sinceIso: string,
): Promise<number> => {
  const [row] = await db
    .select({ spent: spentMicroUsd() })
    .from(usages)
    .where(gte(usages.createdAt, sinceIso));
  return row?.spent ?? 0;
};

export const updateUsageCost = async (input: {
  id: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costMicroUsd: number;
}): Promise<void> => {
  const { id, ...values } = input;
  await db.update(usages).set(values).where(eq(usages.id, id));
};
