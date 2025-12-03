import { index, integer, pgTable } from 'drizzle-orm/pg-core';
import { blogs } from './blogs';

export const blogViews = pgTable(
  'blog_views',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id)
      .primaryKey(),
    views: integer('views').notNull().default(0),
  },
  (table) => [index().on(table.blogId)],
);
