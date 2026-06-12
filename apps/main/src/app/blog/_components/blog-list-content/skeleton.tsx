import { Card } from '@k8o/arte-odyssey';
import type { FC } from 'react';

const CARD_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;

const BlogCardSkeleton: FC = () => (
  <Card interactive>
    <div className="flex h-full animate-pulse flex-col justify-between gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="bg-bg-mute h-6 w-3/4 rounded-md" />
        <div className="bg-bg-mute h-4 w-full rounded-md" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="bg-bg-mute h-4 w-24 rounded-md" />
        <div className="bg-bg-mute h-3 w-32 rounded-md" />
      </div>
    </div>
  </Card>
);

export const BlogListSkeleton: FC = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="bg-bg-mute h-9 w-full max-w-xs animate-pulse rounded-md" />
      <div className="bg-bg-mute h-4 w-20 animate-pulse rounded-md" />
    </div>
    <div className="flex flex-col gap-4">
      {CARD_KEYS.map((key) => (
        <BlogCardSkeleton key={key} />
      ))}
    </div>
  </div>
);
