import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const PUSH_LOG_KINDS = ['readings_updated', 'browser_support_updated'] as const;
export type PushLogKind = (typeof PUSH_LOG_KINDS)[number];

export const pushLogs = sqliteTable(
  'push_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    kind: text('kind').$type<PushLogKind>().notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    url: text('url'),
    // cron 再実行などによる二重通知を防ぐためのキー
    dedupeKey: text('dedupe_key').notNull(),
    succeeded: integer('succeeded').notNull().default(0),
    failed: integer('failed').notNull().default(0),
    sentAt: text('sent_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex('push_logs_dedupe_key_idx').on(table.dedupeKey),
    index('push_logs_sent_at_idx').on(table.sentAt),
    check(
      'push_logs_kind_check',
      sql`${table.kind} IN ('readings_updated', 'browser_support_updated')`,
    ),
  ],
);
