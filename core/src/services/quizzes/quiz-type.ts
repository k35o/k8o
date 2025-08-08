import type { InferSelectModel } from 'drizzle-orm';
import { db } from '#database/db';
import type { quizType } from '@/database/schema/quiz-type';

export const getQuizType = async ({
  type,
}: {
  type: InferSelectModel<typeof quizType>['id'];
}) => {
  return await db.query.quizType.findFirst({
    where: (quiz, { eq }) => eq(quiz.id, type),
  });
};
