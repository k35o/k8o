import '@/drizzle/envConfig';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
import {
  count,
  eq,
  InferSelectModel,
  sql as ormSql,
} from 'drizzle-orm';

export const db = drizzle(sql, { schema });

export const getQuizType = async ({
  type,
}: {
  type: InferSelectModel<typeof schema.quizType>['id'];
}) => {
  return db.query.quizType.findFirst({
    where: (quiz, { eq }) => eq(quiz.id, type),
  });
};

export const getQuizCount = async ({
  type,
}: {
  type: InferSelectModel<typeof schema.quizType>['id'];
}) => {
  return db
    .select({ value: count() })
    .from(schema.quizzes)
    .where(eq(schema.quizzes.type, type));
};

export const getQuiz = async ({
  type,
}: {
  type: InferSelectModel<typeof schema.quizType>['id'];
}) => {
  return db.query.quizzes.findFirst({
    where: (quiz, { eq }) => eq(quiz.type, type),
    with: {
      question: true,
      answers: true,
    },
    orderBy: [ormSql`RANDOM()`],
  });
};
