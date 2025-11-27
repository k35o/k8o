import type { FC } from 'react';
import { CollectionByHighlight } from '@/app/quizzes/_components/collection';
import { QUIZ_TYPE } from '@/services/quizzes';
import { getQuizzes } from '@/services/quizzes/quiz';

async function getAllQuizzes() {
  'use cache';

  return await getQuizzes({ type: QUIZ_TYPE.FISH_KANJI });
}

export const FishKanjiCollection: FC = async () => {
  const quizzes = await getAllQuizzes();
  return <CollectionByHighlight quizzes={quizzes} />;
};
