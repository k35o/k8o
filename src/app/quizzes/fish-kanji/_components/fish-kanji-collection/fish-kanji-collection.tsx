import { CollectionByHighlight } from '@/app/quizzes/_components/collection';
import { getQuizzes } from '@/drizzle/db';
import { FC } from 'react';
import { QUIZ_TYPE } from '../../_utils/constants';

export const FishKanjiCollection: FC = async () => {
  const quizzes = await getQuizzes({ type: QUIZ_TYPE.FISH_KANJI });
  return <CollectionByHighlight quizzes={quizzes} />;
};
