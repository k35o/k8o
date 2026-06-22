import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

import { blogs } from './blogs';

// ブログの日次ビュー数を集計する時系列テーブル。
// (blog_id, date) を複合主キーとし、1日1行に集約する。
// date は UTC 基準の YYYY-MM-DD 文字列。
export const blogViewDailies = sqliteTable(
  'blog_view_dailies',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
    date: text('date').notNull(),
    views: integer('views').notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.blogId, table.date] }),
    // 全ブログ横断の日付レンジ集計（ダッシュボードの推移表示など）向け
    index('blog_view_dailies_date_idx').on(table.date),
  ],
);
