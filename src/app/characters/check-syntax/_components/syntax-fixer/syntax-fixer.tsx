'use client';

import { FC, useState } from 'react';
import { useResetResult } from '../../_state/text';
import { Button } from '@/app/_components/button';
import { IconButton } from '@/app/_components/icon-button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';

export const SyntaxFixer: FC = () => {
  const [count, setCount] = useState(0);
  const resetResult = useResetResult();
  const isDisabledBack = count === 0;
  const isDisabledNext = count === 2;

  const back = () => {
    setCount((prev) => prev - 1);
  };
  const next = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 rounded-md bg-white p-10">
      <div className="flex w-full items-start">
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
          <p className="font-bold leading-none">{count}/1000</p>
        </div>
        <IconButton
          label="次へ"
          onClick={next}
          disabled={isDisabledNext}
        >
          <ChevronRightIcon className="h-8 w-8" />
        </IconButton>
      </div>
    </div>
  );
};
