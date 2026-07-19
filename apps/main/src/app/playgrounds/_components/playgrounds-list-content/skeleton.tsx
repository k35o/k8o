import { Card } from '@k8o/arte-odyssey';
import type { FC } from 'react';

const CARD_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

const PlaygroundCardSkeleton: FC = () => (
  <Card appearance="shadow" interactive>
    <div className="flex h-full animate-pulse flex-col gap-3 p-6">
      <div className="bg-bg-mute h-6 w-3/4 rounded-md" />
      <div className="bg-bg-mute h-4 w-full rounded-md" />
      <div className="bg-bg-mute h-3 w-32 rounded-md" />
    </div>
  </Card>
);

export const PlaygroundsListSkeleton: FC = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="bg-bg-mute h-9 w-full max-w-xs animate-pulse rounded-md" />
      <div className="bg-bg-mute h-4 w-24 animate-pulse rounded-md" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {CARD_KEYS.map((key) => (
        <PlaygroundCardSkeleton key={key} />
      ))}
    </div>
  </div>
);
