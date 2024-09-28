import { CollectionByHighlight } from '@/app/quizzes/_components/collection';
import { getQuizzes } from './../../../_actions';
import { unstable_cache as cache } from 'next/cache';
import { FC } from 'react';
import { QUIZ_TYPE } from '../../_utils/constants';

const getAllQuizzes = await cache(
  () => getQuizzes({ type: QUIZ_TYPE.FISH_KANJI }),
  ['fish-kanji-collection'],
);

export const FishKanjiCollection: FC = async () => {
  const quizzes = await getAllQuizzes();
  return <CollectionByHighlight quizzes={quizzes} />;
};
