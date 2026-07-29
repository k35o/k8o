import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const DATASET_STATES = ['active', 'superseded'] as const;
export type BrowserSupportDatasetState = (typeof DATASET_STATES)[number];

// web-features 上流から取り込んだ正規化済みデータセットの世代管理。active は常に1行で、
// main の表示はこの1行だけを読む。superseded は可用性のためではなくロールバック用に
// 直近数世代を保持する（DB 障害時は superseded も読めないため可用性層にはならない）。
// 検証拒否は行を作らず sync_runs 側に記録する。
// data はアプリ側スキーマ（@repo/helpers の BaselineDataset）で検証する JSON ペイロード。
export const browserSupportDatasets = sqliteTable(
  'browser_support_datasets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    upstreamVersion: text('upstream_version').notNull(),
    state: text('state').$type<BrowserSupportDatasetState>().notNull(),
    data: text('data', { mode: 'json' }).notNull(),
    ingestedAt: text('ingested_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    // 同一バージョンの二重取り込みを防ぐ。並行実行はこの制約違反で片方が no-op になる。
    uniqueIndex('browser_support_datasets_upstream_version_idx').on(
      table.upstreamVersion,
    ),
    index('browser_support_datasets_state_idx').on(table.state),
    check(
      'browser_support_datasets_state_check',
      sql`${table.state} IN ('active', 'superseded')`,
    ),
  ],
);
