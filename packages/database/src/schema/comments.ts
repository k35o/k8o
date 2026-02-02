import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { blogComment } from './blog-comment';
import { feedbacks } from './feedback';

export const comments = sqliteTable(
  'comments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    message: text('message'),
    sentAt: text('sent_at'),
    processingAt: text('processing_at'),
    feedbackId: integer('feedback_id').references(() => feedbacks.id),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    index('comments_id_idx').on(table.id),
    index('comments_feedback_id_idx').on(table.feedbackId),
    index('comments_processing_at_idx').on(table.processingAt),
  ],
);

export const commentsRelations = relations(comments, ({ one }) => ({
  blogComment: one(blogComment, {
    fields: [comments.id],
    references: [blogComment.commentId],
  }),
  feedback: one(feedbacks, {
    fields: [comments.feedbackId],
    references: [feedbacks.id],
  }),
}));
