import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { AlertIcon } from '@k8o/arte-odyssey/icons';
import { type FC, useMemo, useState } from 'react';
import type { Quiz } from '@/services/quizzes';
import { checkAnswer } from '../../_utils/check-answer';

export const Answer: FC<{
  currentQuiz: Quiz;
  status: 'correct' | 'incorrect' | 'none';
  handleAnswer: (isCorrect: boolean) => void;
  handleNextQuestion: () => void;
}> = ({ currentQuiz, status, handleAnswer, handleNextQuestion }) => {
  const [answer, setAnswer] = useState('');
  const otherAnswers = useMemo(() => {
    if (status === 'none') {
      return [];
    }
    return currentQuiz.answers.filter((a) => !checkAnswer(answer, a.answer));
  }, [answer, status, currentQuiz.answers]);

  return (
    <div className="flex flex-col items-center gap-4">
      {status === 'correct' && (
        <div className="flex items-center gap-1 text-fg-success">
          <AlertIcon size="lg" status="success" />
          <p className="font-bold text-xl">正解</p>
        </div>
      )}
      {status === 'incorrect' && (
        <div className="flex items-center gap-1 text-fg-error">
          <AlertIcon size="lg" status="error" />
          <p className="font-bold text-xl">不正解</p>
        </div>
      )}
      {currentQuiz.highlight && (
        <p className="font-noto-sans-jp text-highlight">
          {currentQuiz.highlight}
        </p>
      )}
      {status === 'none' && (
        <>
          <FormControl
            label={currentQuiz.question}
            renderInput={({ labelId: _, ...props }) => {
              return (
                <TextField
                  {...props}
                  isRequired
                  onChange={(e) => {
                    setAnswer(e.target.value);
                  }}
                  value={answer}
                />
              );
            }}
          />
          <Button
            onClick={() => {
              const isCorrect = currentQuiz.answers.some((a) =>
                checkAnswer(answer, a.answer),
              );
              handleAnswer(isCorrect);
            }}
          >
            解答する
          </Button>
        </>
      )}
      {status !== 'none' && (
        <>
          <div className="flex w-full flex-col gap-2">
            <p className="font-bold text-fg-base text-md">あなたの解答</p>
            <p className="w-full rounded-md border border-transparent px-3 py-2">
              {answer ? answer : '未回答'}
            </p>
          </div>
          {otherAnswers.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              <p className="font-bold text-fg-base text-md">
                {status === 'correct' ? '他の答え' : '答え'}
              </p>
              <ul className="ml-6">
                {otherAnswers.map((a) => (
                  <li className="list-disc" key={a.id}>
                    {a.answer}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {currentQuiz.answers[0]?.explanation && (
            <div className="flex w-full flex-col gap-2">
              <p className="font-bold text-fg-base text-md">解説</p>
              <div className="flex flex-col items-center">
                <p>{currentQuiz.answers[0].explanation}</p>
              </div>
            </div>
          )}
          <Button onClick={handleNextQuestion}>次の問題に進む</Button>
        </>
      )}
    </div>
  );
};
