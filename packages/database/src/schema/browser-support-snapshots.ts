import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const SNAPSHOT_STATUSES = ['newly', 'widely'] as const;
type SnapshotStatus = (typeof SNAPSHOT_STATUSES)[number];

// 「前回 push 済みの対応状況」を保持する差分の基準。表示は main が web-features を
// 直接読むため、ここは push 通知の差分検知に必要な最小限（feature_id / name / status / date）だけを持つ。
export const browserSupportSnapshots = sqliteTable(
  'browser_support_snapshots',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    featureId: text('feature_id').notNull(),
    name: text('name').notNull(),
    status: text('status').$type<SnapshotStatus>().notNull(),
    date: text('date').notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex('browser_support_snapshots_feature_id_idx').on(table.featureId),
    check(
      'browser_support_snapshots_status_check',
      sql`${table.status} IN ('newly', 'widely')`,
    ),
  ],
);
