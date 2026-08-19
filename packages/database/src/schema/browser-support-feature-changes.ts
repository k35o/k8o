import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

const CHANGE_STATUSES = ['newly', 'widely'] as const;
export type BrowserSupportChangeStatus = (typeof CHANGE_STATUSES)[number];

// 同期で baseline 状態が変わった機能の履歴。更新通知(件数のみ)の中身を main の
// /browser-support が「最近の更新」として表示するための源。previous_status が null の
// 行は baseline(newly/widely)への新規到達、非 null の行は baseline 内の遷移を表す。
// limited のままの変化は通知と同様に記録しない。データセットの世代置換と同一の
// db.batch で書くため、active データセットと常に整合する。
export const browserSupportFeatureChanges = sqliteTable(
  'browser_support_feature_changes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    featureId: text('feature_id').notNull(),
    featureName: text('feature_name').notNull(),
    status: text('status').$type<BrowserSupportChangeStatus>().notNull(),
    previousStatus: text('previous_status').$type<BrowserSupportChangeStatus>(),
    upstreamVersion: text('upstream_version').notNull(),
    changedAt: text('changed_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    // 表示(直近窓の取得)と prune の両方が changed_at で絞る
    index('browser_support_feature_changes_changed_at_idx').on(table.changedAt),
    check(
      'browser_support_feature_changes_status_check',
      sql`${table.status} IN ('newly', 'widely')`,
    ),
    check(
      'browser_support_feature_changes_previous_status_check',
      sql`${table.previousStatus} IS NULL OR ${table.previousStatus} IN ('newly', 'widely')`,
    ),
  ],
);
