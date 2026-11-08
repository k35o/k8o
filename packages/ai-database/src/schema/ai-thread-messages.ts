import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { aiThreads } from './ai-threads.ts';

export const aiThreadMessages = sqliteTable(
  'ai_thread_messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    threadId: text('thread_id')
      .notNull()
      .references(() => aiThreads.id, { onDelete: 'cascade' }),
    message: text('message', { mode: 'json' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('ai_thread_messages_thread_id_idx').on(table.threadId)],
);
