import type { FC } from 'react';

const ROW_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;

export const BaselineFeatureListSkeleton: FC = () => (
  <section className="bg-bg-raised flex flex-col gap-6 rounded-xl p-5 sm:p-6">
    <div className="flex flex-col gap-4">
      <div className="bg-bg-mute h-9 w-full animate-pulse rounded-md sm:max-w-64" />
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="bg-bg-mute h-5 w-32 animate-pulse rounded-md" />
        <div className="bg-bg-mute h-5 w-32 animate-pulse rounded-md" />
        <div className="bg-bg-mute h-5 w-40 animate-pulse rounded-md" />
      </div>
    </div>
    <div className="flex flex-col gap-4">
      <div className="bg-bg-mute h-8 w-48 animate-pulse rounded-md" />
      <ul className="flex flex-col gap-2.5">
        {ROW_KEYS.map((key) => (
          <li className="flex items-start gap-4 px-1 py-3" key={key}>
            <div className="bg-bg-mute h-5 w-14 animate-pulse rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="bg-bg-mute h-4 w-1/2 animate-pulse rounded-md" />
              <div className="bg-bg-mute h-3 w-1/3 animate-pulse rounded-md" />
              <div className="bg-bg-mute mt-0.5 h-3 w-2/3 animate-pulse rounded-md" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
