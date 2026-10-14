/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { aiThreadMessages } from './ai-thread-messages';
import { user } from './auth-schema';

export const aiThreads = sqliteTable(
  'ai_threads',
  {
    // 行を作る前にクライアントの会話の ID として使うので、採番せず呼び出し側が決める
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    model: text('model').notNull(),
    runId: text('run_id'),
    runHeartbeatAt: text('run_heartbeat_at'),
    stopRequestedAt: text('stop_requested_at'),
    lastInputTokens: integer('last_input_tokens'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [index('ai_threads_user_id_idx').on(table.userId)],
);

export const aiThreadsRelations = relations(aiThreads, ({ one, many }) => ({
  user: one(user, {
    fields: [aiThreads.userId],
    references: [user.id],
  }),
  messages: many(aiThreadMessages),
}));
