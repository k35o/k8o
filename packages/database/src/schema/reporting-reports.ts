import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const reportingReports = sqliteTable(
  'reporting_reports',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: text('type').notNull(),
    url: text('url').notNull(),
    body: text('body', { mode: 'json' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index('reporting_reports_type_idx').on(table.type),
    index('reporting_reports_created_at_idx').on(table.createdAt),
  ],
);
