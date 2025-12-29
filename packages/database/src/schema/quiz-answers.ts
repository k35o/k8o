import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { quizzes } from './quizzes';

export const quizAnswers = sqliteTable(
  'quiz_answers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    answer: text('answer').notNull(),
    explanation: text('explanation'),
  },
  (table) => [index('quiz_answers_quiz_id_idx').on(table.quizId)],
);

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAnswers.quizId],
    references: [quizzes.id],
  }),
}));
