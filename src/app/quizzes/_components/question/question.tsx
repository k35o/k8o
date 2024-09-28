'use client';

import { Quiz } from './../../_types';
import { FC, ReactElement, useCallback, useState } from 'react';
import { Complete } from '../complete';
import { QuizProgress } from '../quiz-progress';
import { Answer } from '../answer';
import { Feedback } from '../feedback';
import { checkAnswer } from '../../_utils/check-answer';

type QuestionProps = FC<{
  quizzes: Quiz[];
  collection: ReactElement;
}>;

type Status = 'correct' | 'incorrect' | 'none' | 'complete';

export const Question: QuestionProps = ({ quizzes, collection }) => {
  const [status, setStatus] = useState<Status>('none');
  const [count, setCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const currentQuiz = quizzes[count];

  if (currentQuiz === undefined) {
    throw new Error('クイズがありません');
  }

  const handleAnswer = useCallback(() => {
    const isCorrect = currentQuiz.answers.some((a) =>
      checkAnswer(answer, a.answer),
    );
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setStatus(isCorrect ? 'correct' : 'incorrect');
  }, [answer, currentQuiz.answers]);

  const handleNextQuestion = useCallback(() => {
    if (count + 1 >= quizzes.length) {
      setStatus('complete');
      setAnswer('');
      return;
    }
    setCount((prev) => prev + 1);
    setStatus('none');
    setAnswer('');
  }, [count, quizzes.length]);

  const handleReset = useCallback(() => {
    setCount(0);
    setStatus('none');
    setAnswer('');
  }, []);

  if (status === 'complete') {
    return (
      <Complete
        score={score}
        maxCount={quizzes.length}
        reset={handleReset}
        collection={collection}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <QuizProgress
        progress={count + 1}
        maxProgress={quizzes.length}
      />
      {status === 'none' ? (
        <Answer
          question={currentQuiz.question}
          highlight={currentQuiz.highlight}
          answer={answer}
          handleAnswer={handleAnswer}
          handleChange={setAnswer}
        />
      ) : (
        <Feedback
          question={currentQuiz.question}
          highlight={currentQuiz.highlight}
          answer={answer}
          answers={currentQuiz.answers}
          status={status}
          handleNextQuestion={handleNextQuestion}
        />
      )}
    </div>
  );
};
