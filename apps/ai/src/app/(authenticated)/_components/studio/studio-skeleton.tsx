import { range } from '@repo/helpers/array/range';
import type { FC } from 'react';

// Studio のシェル（サイドバー＋ヘッダ＋チャット列＋プレビュー列）を模した骨組み。
// 認証ゲート（DB/cookie）の解決中やスタジオへの遷移中に、白画面ではなく構造を見せて
// 待ちのブロック感を減らす。
export const StudioSkeleton: FC = () => (
  <div aria-busy aria-label="読み込み中" className="flex min-h-0 flex-1">
    <div className="bg-bg-subtle border-border-mute hidden w-60 shrink-0 flex-col gap-4 border-r p-4 lg:flex">
      <div className="bg-bg-mute h-4 w-28 rounded-md motion-safe:animate-pulse" />
      <div className="bg-bg-mute h-8 w-full rounded-full motion-safe:animate-pulse" />
      <div className="flex flex-col gap-2">
        {range(0, 2).map((n) => (
          <div
            className="bg-bg-mute h-8 w-full rounded-lg motion-safe:animate-pulse"
            key={`studio-nav-skeleton-${n}`}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {range(0, 4).map((n) => (
          <div
            className="bg-bg-mute h-12 w-full rounded-xl motion-safe:animate-pulse"
            key={`studio-project-skeleton-${n}`}
          />
        ))}
      </div>
    </div>
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-border-mute flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2">
        <div className="bg-bg-mute h-4 w-40 rounded-md motion-safe:animate-pulse" />
        <div className="ml-auto flex items-center gap-2">
          <div className="bg-bg-mute h-8 w-16 rounded-md motion-safe:animate-pulse" />
          <div className="bg-bg-mute h-8 w-16 rounded-md motion-safe:animate-pulse" />
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-1 lg:grid-cols-[440px_minmax(0,1fr)]">
        <div className="border-border-mute hidden min-h-0 flex-col gap-5 border-r p-6 lg:flex">
          {range(0, 4).map((n) => (
            <div
              className="flex flex-col gap-2"
              key={`studio-msg-skeleton-${n}`}
            >
              <div className="bg-bg-mute h-3 w-10 rounded-sm motion-safe:animate-pulse" />
              <div className="bg-bg-mute h-16 w-full rounded-lg motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-bg-surface flex min-h-0 items-stretch justify-center p-6">
          <div className="bg-bg-mute size-full rounded-xl motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);
