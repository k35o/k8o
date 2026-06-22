import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { AI_APPS } from './ai-projects';
import { user } from './auth-schema';

// AI 機能横断の利用ログ。レート制限・コスト把握の基盤（生成1回ごとに1行）。
export const aiUsages = sqliteTable(
  'ai_usages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    app: text('app', { enum: AI_APPS }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // 'generation' など、アプリ内での課金アクション種別。
    kind: text('kind').notNull(),
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index('ai_usages_user_id_idx').on(table.userId),
    index('ai_usages_created_at_idx').on(table.createdAt),
  ],
);

export const aiUsagesRelations = relations(aiUsages, ({ one }) => ({
  user: one(user, {
    fields: [aiUsages.userId],
    references: [user.id],
  }),
}));
