import 'server-only';
import { db } from '@repo/database';
import type { AiApp } from '@repo/database/schema';
import { and, count, eq, gte } from 'drizzle-orm';

// 生成1回ごとの利用ログ（ai_usages）。レート制限とコスト把握の基盤。
const usages = db._schema.aiUsages;
const APP: AiApp = 'ui-studio';
const GENERATION_KIND = 'generation';

export const insertGenerationUsage = async (input: {
  userId: string;
  inputTokens: number | null;
  outputTokens: number | null;
}): Promise<void> => {
  await db.insert(usages).values({
    app: APP,
    userId: input.userId,
    kind: GENERATION_KIND,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
  });
};

export const countRecentGenerations = async (input: {
  userId: string;
  sinceIso: string;
}): Promise<number> => {
  const [row] = await db
    .select({ total: count() })
    .from(usages)
    .where(
      and(
        eq(usages.userId, input.userId),
        eq(usages.app, APP),
        eq(usages.kind, GENERATION_KIND),
        gte(usages.createdAt, input.sinceIso),
      ),
    );
  return row?.total ?? 0;
};
