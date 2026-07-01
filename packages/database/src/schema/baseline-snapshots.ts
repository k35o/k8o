import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const BASELINE_STATUSES = ['newly', 'widely'] as const;
type BaselineStatus = (typeof BASELINE_STATUSES)[number];

// webstatus.dev の browser_implementations（機能ごとのブラウザ別対応状況）。
// キーは chrome / chrome_android / edge / firefox / firefox_android / safari / safari_ios など。
export type BrowserImplementations = Record<
  string,
  { version?: string; status?: string; date?: string }
>;

export const baselineSnapshots = sqliteTable(
  'baseline_snapshots',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    featureId: text('feature_id').notNull(),
    name: text('name').notNull(),
    status: text('status').$type<BaselineStatus>().notNull(),
    date: text('date').notNull(),
    browserImplementations: text('browser_implementations', {
      mode: 'json',
    }).$type<BrowserImplementations>(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex('baseline_snapshots_feature_id_idx').on(table.featureId),
    check(
      'baseline_snapshots_status_check',
      sql`${table.status} IN ('newly', 'widely')`,
    ),
  ],
);
