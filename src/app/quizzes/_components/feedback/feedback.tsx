import { AlertIcon } from '@/components/alert-icon';
import { Button } from '@/components/button';
import { Quiz } from '../../_types';
import { FC } from 'react';
import { checkAnswer } from '../../_utils/check-answer';
import { TextTag } from '@/components/text-tag';

export const Feedback: FC<{
  question: string;
  highlight: string | null;
  answer: string;
  answers: Quiz['answers'];
  status: 'correct' | 'incorrect';
  handleNextQuestion: () => void;
}> = ({
  question,
  highlight,
  answer,
  answers,
  status,
  handleNextQuestion,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {status === 'correct' ? (
        <div className="flex items-center gap-1">
          <AlertIcon status="success" />
          <p className="text-xl font-bold text-textSuccess">正解</p>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <AlertIcon status="error" />
          <p className="text-xl font-bold text-textError">不正解</p>
        </div>
      )}
      <div className="flex w-full flex-col gap-1">
        <div>
          <TextTag text="問題" />
        </div>
        <div className="flex flex-col items-center">
          <p>{question}</p>
          {highlight && (
            <p className="font-notoSansJp text-9xl">{highlight}</p>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <div>
          <TextTag text="あなたの解答" />
        </div>
        <div className="flex flex-col items-center">
          <p>{answer}</p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <div>
          <TextTag
            text={status === 'correct' ? '他の答え' : '答え'}
          />
        </div>
        <div className="flex flex-col items-center">
          <ul>
            {answers
              .filter((a) => !checkAnswer(answer, a.answer))
              .map((a) => (
                <li key={a.id} className="list-disc">
                  {a.answer}
                </li>
              ))}
          </ul>
        </div>
      </div>
      {answers[0]?.explanation && (
        <div className="flex w-full flex-col gap-1">
          <div>
            <TextTag text="解説" />
          </div>
          <div className="flex flex-col items-center">
            <p>{answers[0].explanation}</p>
          </div>
        </div>
      )}
      <Button onClick={handleNextQuestion}>次の問題に進む</Button>
    </div>
  );
};
