import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { quizAnswers } from './quiz-answers';
import { quizQuestions } from './quiz-questions';
import { quizType } from './quiz-type';

export const quizzes = sqliteTable(
  'quizzes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: integer('type')
      .notNull()
      .references(() => quizType.id),
  },
  (table) => [index('quizzes_type_idx').on(table.type)],
);

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  type: one(quizType),
  question: one(quizQuestions, {
    fields: [quizzes.id],
    references: [quizQuestions.quizId],
  }),
  answers: many(quizAnswers),
}));
