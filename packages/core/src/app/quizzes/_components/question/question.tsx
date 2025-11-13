'use client';

import { useRouter } from 'next/navigation';
import { type FC, useCallback, useMemo, useState } from 'react';
import type { Quiz } from '@/services/quizzes';
import { Answer } from '../answer';
import { Complete } from '../complete';
import { QuizProgress } from '../quiz-progress';

type QuestionProps = FC<{
  quizzes: Quiz[];
}>;

type Status = 'correct' | 'incorrect' | 'none' | 'complete';

export const Question: QuestionProps = ({ quizzes }) => {
  const [status, setStatus] = useState<Status>('none');
  const [count, setCount] = useState(0);
  const [score, setScore] = useState(0);
  const currentQuiz = useMemo(() => {
    return quizzes[count];
  }, [count, quizzes]);

  const router = useRouter();

  if (currentQuiz === undefined) {
    throw new Error('クイズがありません');
  }

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setStatus(isCorrect ? 'correct' : 'incorrect');
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (count + 1 >= quizzes.length) {
      setStatus('complete');
      return;
    }
    setCount((prev) => prev + 1);
    setStatus('none');
  }, [count, quizzes.length]);

  const handleReset = useCallback(() => {
    router.refresh();
  }, [router]);

  if (status === 'complete') {
    return (
      <Complete
        maxCount={quizzes.length}
        quizzes={quizzes}
        reset={handleReset}
        score={score}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <QuizProgress maxProgress={quizzes.length} progress={count + 1} />
      <Answer
        currentQuiz={currentQuiz}
        handleAnswer={handleAnswer}
        handleNextQuestion={handleNextQuestion}
        key={count}
        status={status}
      />
    </div>
  );
};
