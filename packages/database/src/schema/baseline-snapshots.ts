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

export const baselineSnapshots = sqliteTable(
  'baseline_snapshots',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    featureId: text('feature_id').notNull(),
    name: text('name').notNull(),
    status: text('status').$type<BaselineStatus>().notNull(),
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
    uniqueIndex('baseline_snapshots_feature_id_idx').on(table.featureId),
    check(
      'baseline_snapshots_status_check',
      sql`${table.status} IN ('newly', 'widely')`,
    ),
  ],
);
