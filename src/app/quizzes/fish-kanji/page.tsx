import { getQuizzes } from '@/drizzle/db';
import { QUIZ_TYPE } from './_utils/constants';
import { Question } from '../_components/question';
import { FishKanjiCollection } from './_components/fish-kanji-collection';
import { LinkButton } from '@/components/link-button';

export const revalidate = 0;

export default async function Page() {
  const quizzes = await getQuizzes({
    type: QUIZ_TYPE.FISH_KANJI,
    byRandom: true,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <LinkButton href="/quizzes/fish-kanji/list">
          うおへんの漢字一覧
        </LinkButton>
      </div>
      <Question
        quizzes={quizzes}
        collection={<FishKanjiCollection />}
      />
    </div>
  );
}
