import { getQuizzes } from './../_actions';
import { QUIZ_TYPE } from './_utils/constants';
import { Question } from '../_components/question';
import { LinkButton } from '@/components/link-button';

const getLimit = (questionCount: string): number => {
  const limit = parseInt(questionCount, 10);
  if (isNaN(limit) || limit < 1) {
    return 10;
  }
  return limit;
};

export default async function Page({
  searchParams,
}: {
  searchParams: { questionCount: string };
}) {
  const limit = getLimit(searchParams.questionCount);

  const quizzes = await getQuizzes({
    type: QUIZ_TYPE.FISH_KANJI,
    byRandom: true,
    limit,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <LinkButton href="/quizzes/fish-kanji/list">
          うおへんの漢字一覧
        </LinkButton>
      </div>
      <Question quizzes={quizzes} />
    </div>
  );
}
