import { range } from '@repo/helpers/array/range';
import type { FC } from 'react';

export const ChatSkeleton: FC = () => (
  <div aria-busy aria-label="読み込み中" className="flex min-h-0 flex-1">
    <div className="bg-bg-subtle border-border-mute hidden w-60 shrink-0 flex-col gap-4 border-r p-4 lg:flex">
      <div className="bg-bg-mute h-4 w-28 rounded-md motion-safe:animate-pulse" />
      <div className="bg-bg-mute h-8 w-full rounded-full motion-safe:animate-pulse" />
      <div className="flex flex-col gap-2">
        {range(0, 3).map((n) => (
          <div
            className="bg-bg-mute h-8 w-full rounded-lg motion-safe:animate-pulse"
            key={`chat-nav-skeleton-${n}`}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {range(0, 4).map((n) => (
          <div
            className="bg-bg-mute h-12 w-full rounded-xl motion-safe:animate-pulse"
            key={`chat-thread-skeleton-${n}`}
          />
        ))}
      </div>
    </div>
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-border-mute flex items-center gap-4 border-b px-4 py-3">
        <div className="bg-bg-mute h-4 w-40 rounded-md motion-safe:animate-pulse" />
        <div className="bg-bg-mute ml-auto h-5 w-20 rounded-md motion-safe:animate-pulse" />
      </div>
      <div className="min-h-0 flex-1 p-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <div className="bg-bg-mute ml-auto h-10 w-1/2 rounded-2xl motion-safe:animate-pulse" />
          <div className="flex flex-col gap-2">
            {range(0, 3).map((n) => (
              <div
                className="bg-bg-mute h-4 w-full rounded-md motion-safe:animate-pulse"
                key={`chat-message-skeleton-${n}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-border-mute border-t p-4">
        <div className="bg-bg-mute mx-auto h-14 w-full max-w-3xl rounded-2xl motion-safe:animate-pulse" />
      </div>
    </div>
  </div>
);
