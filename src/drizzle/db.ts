import '@/drizzle/envConfig';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
import { InferSelectModel, sql as ormSql } from 'drizzle-orm';

export const db = drizzle(sql, { schema });

export type Quiz = {
  id: number;
  highlight: string | null;
  question: string;
  answers: {
    id: number;
    answer: string;
    explanation: string | null;
  }[];
};

export const getQuizType = async ({
  type,
}: {
  type: InferSelectModel<typeof schema.quizType>['id'];
}) => {
  return db.query.quizType.findFirst({
    where: (quiz, { eq }) => eq(quiz.id, type),
  });
};

// NOTE:問題数が多いクイズを作った場合はページネーションを実装する
export const getQuizzes = async ({
  type,
}: {
  type: InferSelectModel<typeof schema.quizType>['id'];
}): Promise<Quiz[]> => {
  const res = await db.query.quizzes.findMany({
    where: (quiz, { eq }) => eq(quiz.type, type),
    with: {
      question: true,
      answers: true,
    },
    orderBy: [ormSql`random()`],
  });

  return res.map((quiz) => ({
    id: quiz.id,
    highlight: quiz.question.highlight,
    question: quiz.question.question,
    answers: quiz.answers.map((answer) => ({
      id: answer.id,
      answer: answer.answer,
      explanation: answer.explanation,
    })),
  }));
};
