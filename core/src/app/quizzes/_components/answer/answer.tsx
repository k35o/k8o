import { checkAnswer } from '../../_utils/check-answer';
import { Quiz } from '@/services/quizzes';
import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { AlertIcon } from '@k8o/arte-odyssey/icons';
import { FC, useMemo, useState } from 'react';

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
    return currentQuiz.answers.filter(
      (a) => !checkAnswer(answer, a.answer),
    );
  }, [answer, status, currentQuiz.answers]);

  return (
    <div className="flex flex-col items-center gap-4">
      {status === 'correct' && (
        <div className="text-fg-success flex items-center gap-1">
          <AlertIcon status="success" size="lg" />
          <p className="text-xl font-bold">正解</p>
        </div>
      )}
      {status === 'incorrect' && (
        <div className="text-fg-error flex items-center gap-1">
          <AlertIcon status="error" size="lg" />
          <p className="text-xl font-bold">不正解</p>
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
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                  }}
                  isRequired
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
            <p className="text-md text-fg-base font-bold">
              あなたの解答
            </p>
            <p className="w-full rounded-md border border-transparent px-3 py-2">
              {answer ? answer : '未回答'}
            </p>
          </div>
          {otherAnswers.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              <p className="text-md text-fg-base font-bold">
                {status === 'correct' ? '他の答え' : '答え'}
              </p>
              <ul className="ml-6">
                {otherAnswers.map((a) => (
                  <li key={a.id} className="list-disc">
                    {a.answer}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {currentQuiz.answers[0]?.explanation && (
            <div className="flex w-full flex-col gap-2">
              <p className="text-md text-fg-base font-bold">解説</p>
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
