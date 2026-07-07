import 'server-only';
import { db } from '@repo/database';
import type { AiApp } from '@repo/database/schema';
import { and, count, eq, gte } from 'drizzle-orm';

// 公開共有の Sandbox serve/起動ログ（ai_share_serves）。クロスインスタンスなグローバルレート制限の基盤。
const serves = db._schema.aiShareServes;
const APP: AiApp = 'ui-studio';

export const countRecentServes = async (input: {
  sinceIso: string;
}): Promise<number> => {
  const [row] = await db
    .select({ total: count() })
    .from(serves)
    .where(and(eq(serves.app, APP), gte(serves.createdAt, input.sinceIso)));
  return row?.total ?? 0;
};

export const recordServe = async (input: { slug: string }): Promise<void> => {
  await db.insert(serves).values({ app: APP, slug: input.slug });
};
