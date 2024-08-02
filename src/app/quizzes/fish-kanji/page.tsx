import { getQuiz, getQuizCount, getQuizType } from '@/drizzle/db';
import { QUIZ_TYPE } from './_utils/constants';

export default async function Page() {
  const quizType = await getQuizType({ type: QUIZ_TYPE.FISH_KANJI });
  const quizzes = await getQuiz({ type: QUIZ_TYPE.FISH_KANJI });
  const quizCount = await getQuizCount({
    type: QUIZ_TYPE.FISH_KANJI,
  });
  console.log(quizzes);
  console.log(quizCount);
  return (
    <section className="flex h-full flex-col justify-between gap-6 rounded-lg bg-white p-10">
      {quizType ? <>{quizType.name}</> : <></>}
    </section>
  );
}
