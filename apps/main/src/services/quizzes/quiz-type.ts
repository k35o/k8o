import { db } from '@repo/database';
import type { InferSelectModel } from 'drizzle-orm';

export const getQuizType = async ({
  type,
}: {
  type: InferSelectModel<typeof db._schema.quizType>['id'];
}) => {
  return await db.query.quizType.findFirst({
    where: (quiz, { eq }) => eq(quiz.id, type),
  });
};
