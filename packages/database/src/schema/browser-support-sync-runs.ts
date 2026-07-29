import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

const SYNC_TRIGGERS = ['cron', 'manual', 'monitor'] as const;
export type BrowserSupportSyncTrigger = (typeof SYNC_TRIGGERS)[number];

const SYNC_RESULTS = [
  'applied',
  'noop',
  'skipped_major',
  'fetch_failed',
  'validation_failed',
  'db_failed',
] as const;
export type BrowserSupportSyncResult = (typeof SYNC_RESULTS)[number];

// 同期の心拍。「最後に成功した同期はいつか」を観測するため、新バージョンが無かった
// noop も必ず記録する。cron が静かに止まる障害はこの心拍の途絶として外形監視に映る。
export const browserSupportSyncRuns = sqliteTable(
  'browser_support_sync_runs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    trigger: text('trigger').$type<BrowserSupportSyncTrigger>().notNull(),
    result: text('result').$type<BrowserSupportSyncResult>().notNull(),
    // 発見できた上流バージョン。発見自体に失敗した run では null。
    upstreamVersion: text('upstream_version'),
    // エラー要約・skip 件数などの補足。
    detail: text('detail'),
    durationMs: integer('duration_ms'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index('browser_support_sync_runs_created_at_idx').on(table.createdAt),
    check(
      'browser_support_sync_runs_trigger_check',
      sql`${table.trigger} IN ('cron', 'manual', 'monitor')`,
    ),
    check(
      'browser_support_sync_runs_result_check',
      sql`${table.result} IN ('applied', 'noop', 'skipped_major', 'fetch_failed', 'validation_failed', 'db_failed')`,
    ),
  ],
);
