'use client';

import { FC } from 'react';
import {
  useInvalidCount,
  useInvalidResult,
  useResetResult,
  useSetFixTextsField,
} from '../../_state/text';
import { Button } from '@/app/_components/button';
import { IconButton } from '@/app/_components/icon-button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import { useStep } from '@/app/_hooks/step';
import { Alert } from '@/app/_components/alert';
import { Heading } from '@/app/_components/heading';
import { Textarea } from '@/app/_components/form/textarea';

export const SyntaxFixer: FC = () => {
  const invalidCount = useInvalidCount();
  const { count, isDisabledBack, isDisabledNext, back, next } =
    useStep({
      initialCount: 1,
      maxCount: invalidCount,
    });
  const resetResult = useResetResult();

  return (
    <div className="flex flex-col items-center justify-center gap-8 rounded-md bg-white p-10">
      <div className="flex w-full">
        <Button onClick={resetResult}>テキスト入力に戻る</Button>
      </div>
      <div className="flex w-full items-center justify-evenly">
        <IconButton
          label="戻る"
          onClick={back}
          disabled={isDisabledBack}
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </IconButton>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-300">
          <p className="font-bold leading-none">
            {count}/{invalidCount}
          </p>
        </div>
        <IconButton
          label="次へ"
          onClick={next}
          disabled={isDisabledNext}
        >
          <ChevronRightIcon className="h-8 w-8" />
        </IconButton>
      </div>
      <FixText key={count} count={count} />
    </div>
  );
};

const FixText: FC<{ count: number }> = ({ count }) => {
  const { resultText, resultMessage } = useInvalidResult(count);
  const { fixText, handleFixTextChange } = useSetFixTextsField(
    count,
    resultText,
  );

  return (
    <div>
      <Alert status="error" message={resultMessage} />
      <div className="mt-8 grid gap-4">
        <section className="grid gap-2">
          <Heading type="h4">原文</Heading>
          <div className=" rounded-md border border-gray-700 px-3 py-2">
            <p className="text-wrap break-all">{resultText}</p>
          </div>
        </section>
        <section className="grid gap-2 ">
          <Heading type="h4">修正</Heading>
          <Textarea
            value={fixText}
            onChange={handleFixTextChange}
            autoResize
          />
        </section>
      </div>
    </div>
  );
};
