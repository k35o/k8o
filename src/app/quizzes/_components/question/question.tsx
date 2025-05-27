'use client';

import { Answer } from '../answer';
import { Complete } from '../complete';
import { QuizProgress } from '../quiz-progress';
import { Quiz } from '@/services/quizzes';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useMemo, useState } from 'react';

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
        score={score}
        maxCount={quizzes.length}
        reset={handleReset}
        quizzes={quizzes}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <QuizProgress
        progress={count + 1}
        maxProgress={quizzes.length}
      />
      <Answer
        key={count}
        currentQuiz={currentQuiz}
        status={status}
        handleAnswer={handleAnswer}
        handleNextQuestion={handleNextQuestion}
      />
    </div>
  );
};
