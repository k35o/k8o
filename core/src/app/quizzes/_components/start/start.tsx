'use client';

import { QUIZ_OPTIONS, QuizKey } from '@/services/quizzes';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { NumberField } from '@k8o/arte-odyssey/form/number-field';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import { ListBox } from '@k8o/arte-odyssey/list-box';
import Link from 'next/link';
import { FC, useCallback, useState } from 'react';

export const Start: FC = () => {
  const [selectedQuiz, setSelectedQuiz] =
    useState<QuizKey>('fish-kanji');
  const [questionCount, setQuestionCount] = useState(10);

  const onSelect = useCallback((key: string) => {
    if (QUIZ_OPTIONS.some((option) => option.key === key)) {
      setSelectedQuiz(key as QuizKey);
    }
  }, []);

  return (
    <section className="grid gap-12 py-10">
      <div className="flex flex-col gap-4">
        <fieldset role="group" className="flex w-full flex-col gap-2">
          <p className="text-md text-fg-base font-bold">種類</p>
          <ListBox.Root
            placement="bottom-start"
            options={QUIZ_OPTIONS}
            value={selectedQuiz}
            onSelect={onSelect}
          >
            <ListBox.Trigger />
            <ListBox.Content />
          </ListBox.Root>
        </fieldset>
        <FormControl
          label="問題数"
          helpText="数値が問題数を超える場合は全ての問題が出題されます"
          renderInput={({ labelId: _, ...props }) => (
            <NumberField
              {...props}
              value={questionCount}
              onChange={setQuestionCount}
              min={1}
              max={100}
            />
          )}
        />
      </div>
      <LinkButton
        href={`/quizzes/${selectedQuiz}?questionCount=${questionCount.toString()}`}
        renderAnchor={(props) => <Link {...props} />}
      >
        スタート
      </LinkButton>
    </section>
  );
};
