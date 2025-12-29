import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { blogs } from './blogs';

// PRIMARY KEYはすでにインデックスとして機能するため、追加インデックスは不要
export const blogViews = sqliteTable('blog_views', {
  blogId: integer('blog_id')
    .notNull()
    .references(() => blogs.id)
    .primaryKey(),
  views: integer('views').notNull().default(0),
});
