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
    <section className="h-full rounded-lg bg-white p-10">
      <Question
        quizzes={quizzes}
        collection={<FishKanjiCollection />}
      />
    </section>
  );
}
