import { getQuizzes } from '@/drizzle/db';
import { QUIZ_TYPE } from './_utils/constants';
import { Question } from '../_components/question';
import { FishKanjiCollection } from './_components/fish-kanji-collection';

export const revalidate = 0;

export default async function Page() {
  const quizzes = await getQuizzes({
    type: QUIZ_TYPE.FISH_KANJI,
    byRandom: true,
  });

  return (
    <Question
      quizzes={quizzes}
      collection={<FishKanjiCollection />}
    />
  );
}
