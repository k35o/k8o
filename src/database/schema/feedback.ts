import { comments } from './comments';
import { relations } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const feedbacksRelations = relations(
  feedbacks,
  ({ many }) => ({
    comments: many(comments),
  }),
);
