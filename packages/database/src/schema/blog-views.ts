import { index, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { blogs } from './blogs';

export const blogViews = sqliteTable(
  'blog_views',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id)
      .primaryKey(),
    views: integer('views').notNull().default(0),
  },
  (table) => [index('blog_views_blog_id_idx').on(table.blogId)],
);
