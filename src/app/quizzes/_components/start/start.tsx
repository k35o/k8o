'use client';

import { ListBox } from '@/components/list-box';
import { LinkButton } from '@/components/link-button';
import { ComponentProps, FC, useCallback, useState } from 'react';
import { FormControl } from '@/components/form/form-control';
import { NumberField } from '@/components/form/number-field';

const QUIZ_OPTIONS = [
  {
    key: 'fish-kanji',
    label: 'うおへんクイズ',
  },
] as const satisfies ComponentProps<typeof ListBox.Root>['options'];

type QuizType = (typeof QUIZ_OPTIONS)[number]['key'];

export const Start: FC = () => {
  const [selectedQuiz, setSelectedQuiz] =
    useState<QuizType>('fish-kanji');
  const [questionCount, setQuestionCount] = useState(10);

  const onSelect = useCallback((key: string) => {
    if (QUIZ_OPTIONS.some((option) => option.key === key)) {
      setSelectedQuiz(key as QuizType);
    }
  }, []);

  return (
    <section className="bg-bg-base/55 flex h-full flex-col gap-12 rounded-lg p-10">
      <div className="flex flex-col gap-4">
        <fieldset role="group" className="flex w-full flex-col gap-2">
          <p className="text-md text-text-body font-bold">種類</p>
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
      >
        スタート
      </LinkButton>
    </section>
  );
};
