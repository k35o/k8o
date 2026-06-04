import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// プッシュ通知の業務イベント種別。値は使われず型のみ共有されるため、
// 公開するのは型 PushLogKind のみ（SSoT）とし、定義元の配列は非公開にする。
const PUSH_LOG_KINDS = ['readings_updated', 'baseline_updated'] as const;
export type PushLogKind = (typeof PUSH_LOG_KINDS)[number];

export const pushLogs = sqliteTable(
  'push_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // 業務イベント種別
    kind: text('kind').$type<PushLogKind>().notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    // 通知クリック時の遷移先 URL
    url: text('url'),
    // cron 再実行などによる二重通知を防ぐためのキー
    dedupeKey: text('dedupe_key').notNull(),
    // 送信結果（非公開・運用用）
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
      sql`${table.kind} IN ('readings_updated', 'baseline_updated')`,
    ),
  ],
);
