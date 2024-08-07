import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import clsx from 'clsx';
import { FC, ReactElement } from 'react';

export const Complete: FC<{
  score: number;
  maxCount: number;
  collection: ReactElement;
  reset: () => void;
}> = ({ score, maxCount, collection, reset }) => {
  const percentage = score / maxCount;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2">
        <Heading type="h4">クイズ終了</Heading>
        {/* 0.8以上でsuccess 0.5以下でwarning 0.3以下でerror */}
        <p
          className={clsx('text-2xl', {
            'text-success': percentage >= 0.8,
            'text-warning': percentage <= 0.5 && percentage > 0.3,
            'text-error': percentage <= 0.3,
          })}
        >
          スコア: {score}/{maxCount}
        </p>
      </div>
      <Button onClick={reset}>もう一度挑戦する</Button>
      <div className="flex w-full flex-col gap-2">
        <Heading type="h4">問題一覧</Heading>
        {collection}
      </div>
    </div>
  );
};
