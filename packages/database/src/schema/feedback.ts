/* eslint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { comments } from './comments';

export const feedbacks = sqliteTable('feedbacks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const feedbacksRelations = relations(feedbacks, ({ many }) => ({
  comments: many(comments),
}));
