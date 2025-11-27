import { type FC, Suspense } from 'react';
import { QUIZ_TYPE } from '@/services/quizzes';
import { getQuizzes } from '@/services/quizzes/quiz';
import { Question } from '../_components/question';

const getLimit = (questionCount: string | string[] | undefined): number => {
  if (typeof questionCount !== 'string') {
    return 10;
  }
  const limit = Number.parseInt(questionCount, 10);
  if (Number.isNaN(limit) || limit < 1) {
    return 10;
  }
  return limit;
};

const FishKanjiQuestion: FC<{ limit: number }> = async ({ limit }) => {
  const quizzes = await getQuizzes({
    type: QUIZ_TYPE.FISH_KANJI,
    byRandom: true,
    limit,
  });

  return <Question quizzes={quizzes} />;
};

async function QuizContent({ searchParams }: PageProps<'/quizzes/fish-kanji'>) {
  const params = await searchParams;
  const limit = getLimit(params['questionCount']);

  return (
    <section>
      {/* NOTE:route.refreshでsuspenseを有効にするために常に変わり続けるkeyを指定する */}
      <Suspense
        fallback={
          <div className="flex grow items-center justify-center">
            <p className="font-bold text-2xl">問題を読み込み中です...</p>
          </div>
        }
        key={new Date().toString()}
      >
        <FishKanjiQuestion limit={limit} />
      </Suspense>
    </section>
  );
}

export default function Page(props: PageProps<'/quizzes/fish-kanji'>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizContent {...props} />
    </Suspense>
  );
}
