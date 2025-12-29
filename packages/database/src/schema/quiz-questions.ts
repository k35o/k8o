import { relations } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { quizzes } from './quizzes';

export const quizQuestions = sqliteTable(
  'quiz_questions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    highlight: text('highlight'),
    question: text('question').notNull(),
  },
  (table) => [uniqueIndex('quiz_questions_quiz_id_idx').on(table.quizId)],
);

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));
