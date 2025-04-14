import { blogs } from './blogs';
import { index, integer, pgTable } from 'drizzle-orm/pg-core';

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
