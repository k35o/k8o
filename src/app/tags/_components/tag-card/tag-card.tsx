import { InteractiveCard } from '@/components/card';
import { ChevronIcon } from '@/components/icons';
import { Separator } from '@/components/separator';
import Link from 'next/link';
import { FC } from 'react';

export const TagCard: FC<{
  id: number;
  name: string;
  count: number;
}> = ({ id, name, count }) => {
  return (
    <InteractiveCard width="fit" animation="off">
      <Link
        href={`/tags/${id.toString()}`}
        aria-label="コンテンツを見る"
        className="group hover:bg-primary-bg-mute hover:text-primary-fg hover:border-primary-border flex w-70 flex-col gap-2 rounded-lg p-4 hover:border"
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-bold">{name}</span>
          <span className="bg-primary-bg text-primary-fg min-w-8 rounded-full px-2 py-1 text-center">
            {count}
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm">コンテンツを見る</span>
          <span className="hidden group-hover:block">
            <ChevronIcon direction="right" size="sm" />
          </span>
        </div>
      </Link>
    </InteractiveCard>
  );
};
