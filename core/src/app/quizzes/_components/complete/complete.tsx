import { CollectionByHighlight } from '../collection';
import { Quiz } from '@/services/quizzes';
import { Button } from '@k8o/components/button';
import { Heading } from '@k8o/components/heading';
import { HistoryIcon, ListIcon } from '@k8o/components/icons';
import { LinkButton } from '@k8o/components/link-button';
import { cn } from '@k8o/helpers/cn';
import { FC } from 'react';

export const Complete: FC<{
  score: number;
  maxCount: number;
  quizzes: Quiz[];
  reset: () => void;
}> = ({ score, maxCount, quizzes, reset }) => {
  const percentage = score / maxCount;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-6">
        <Heading type="h4">クイズ終了</Heading>
        {/* 0.8以上でsuccess 0.5以下でwarning 0.3以下でerror */}
        <p
          className={cn('text-2xl', {
            'text-fg-success': percentage >= 0.8,
            'text-fg-warning': percentage <= 0.5 && percentage > 0.3,
            'text-fg-error': percentage <= 0.3,
          })}
        >
          スコア: {score}/{maxCount}
        </p>
      </div>
      <div className="flex flex-col-reverse justify-around gap-6 md:w-full md:flex-row">
        <LinkButton
          href="/quizzes/fish-kanji/list"
          variant="outlined"
          startIcon={<ListIcon />}
        >
          うおへんの漢字一覧
        </LinkButton>
        <Button onClick={reset} startIcon={<HistoryIcon />}>
          もう一度挑戦する
        </Button>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Heading type="h4">問題一覧</Heading>
        <CollectionByHighlight quizzes={quizzes} />
      </div>
    </div>
  );
};
