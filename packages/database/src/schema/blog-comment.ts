import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { blogs } from './blogs';
import { comments } from './comments';

export const blogComment = sqliteTable(
  'blog_comment',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
    commentId: integer('commend_id')
      .notNull()
      .references(() => comments.id),
  },
  (table) => [
    index('blog_comment_blog_id_idx').on(table.blogId),
    index('blog_comment_comment_id_idx').on(table.commentId),
  ],
);

export const blogCommentRelations = relations(blogComment, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogComment.blogId],
    references: [blogs.id],
  }),
  feedback: one(comments, {
    fields: [blogComment.commentId],
    references: [comments.id],
  }),
}));
