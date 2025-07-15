import { CollectionByHighlight } from '@/app/quizzes/_components/collection';
import { QUIZ_TYPE } from '@/services/quizzes';
import { getQuizzes } from '@/services/quizzes/quiz';
import { unstable_cache as cache } from 'next/cache';
import { FC } from 'react';

const getAllQuizzes = cache(
  () => getQuizzes({ type: QUIZ_TYPE.FISH_KANJI }),
  ['fish-kanji-collection'],
);

export const FishKanjiCollection: FC = async () => {
  const quizzes = await getAllQuizzes();
  return <CollectionByHighlight quizzes={quizzes} />;
};
