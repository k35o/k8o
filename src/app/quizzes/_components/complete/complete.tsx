import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { cn } from '@/utils/cn';
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
          className={cn('text-2xl', {
            'text-textSuccess': percentage >= 0.8,
            'text-textWarning': percentage <= 0.5 && percentage > 0.3,
            'text-textError': percentage <= 0.3,
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
