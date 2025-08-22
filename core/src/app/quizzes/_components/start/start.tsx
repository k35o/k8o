'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { NumberField } from '@k8o/arte-odyssey/form/number-field';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import { ListBox } from '@k8o/arte-odyssey/list-box';
import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useCallback, useState } from 'react';
import { QUIZ_OPTIONS, type QuizKey } from '@/services/quizzes';

export const Start: FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizKey>('fish-kanji');
  const [questionCount, setQuestionCount] = useState(10);

  const onSelect = useCallback((key: string) => {
    if (QUIZ_OPTIONS.some((option) => option.key === key)) {
      setSelectedQuiz(key as QuizKey);
    }
  }, []);

  return (
    <section className="grid gap-12 py-10">
      <div className="flex flex-col gap-4">
        <fieldset className="flex w-full flex-col gap-2">
          <p className="font-bold text-fg-base text-md">種類</p>
          <ListBox.Root
            onSelect={onSelect}
            options={QUIZ_OPTIONS}
            placement="bottom-start"
            value={selectedQuiz}
          >
            <ListBox.Trigger />
            <ListBox.Content />
          </ListBox.Root>
        </fieldset>
        <FormControl
          helpText="数値が問題数を超える場合は全ての問題が出題されます"
          label="問題数"
          renderInput={({ labelId: _, ...props }) => (
            <NumberField
              {...props}
              max={100}
              min={1}
              onChange={setQuestionCount}
              value={questionCount}
            />
          )}
        />
      </div>
      <LinkButton
        href={
          `/quizzes/${selectedQuiz}?questionCount=${questionCount.toString()}` as Route
        }
        renderAnchor={(props) => <Link {...props} />}
      >
        スタート
      </LinkButton>
    </section>
  );
};
