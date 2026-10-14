import { range } from '@repo/helpers/array/range';
import type { FC } from 'react';

export const SidebarListSkeleton: FC = () => (
  <div aria-busy aria-label="読み込み中" className="flex flex-col gap-2 p-2">
    {range(0, 4).map((n) => (
      <div
        className="bg-bg-mute h-12 w-full rounded-xl motion-safe:animate-pulse"
        key={`sidebar-list-skeleton-${n}`}
      />
    ))}
  </div>
);
