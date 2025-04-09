import { getQuizzes } from '../_services';
import { QUIZ_TYPE } from './_utils/constants';
import { Question } from '../_components/question';
import { FC, Suspense } from 'react';

const getLimit = (questionCount: string): number => {
  const limit = parseInt(questionCount, 10);
  if (isNaN(limit) || limit < 1) {
    return 10;
  }
  return limit;
};

const FishKanjiQuestion: FC<{ limit: number }> = async ({
  limit,
}) => {
  const quizzes = await getQuizzes({
    type: QUIZ_TYPE.FISH_KANJI,
    byRandom: true,
    limit,
  });

  return <Question quizzes={quizzes} />;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ questionCount: string }>;
}) {
  const limit = getLimit((await searchParams).questionCount);

  return (
    <section>
      {/* NOTE:route.refreshでsuspenseを有効にするために常に変わり続けるkeyを指定する */}
      <Suspense
        key={new Date().toString()}
        fallback={
          <div className="flex grow items-center justify-center">
            <p className="text-2xl font-bold">
              問題を読み込み中です...
            </p>
          </div>
        }
      >
        <FishKanjiQuestion limit={limit} />
      </Suspense>
    </section>
  );
}
