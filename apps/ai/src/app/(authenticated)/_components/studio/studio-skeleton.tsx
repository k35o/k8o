import { range } from '@repo/helpers/array/range';
import type { FC } from 'react';

import { ToolHeader } from '../tool-frame';

// 本文（ヘッダ＋チャット列＋プレビュー列）を模した骨組み。認証ゲート（DB/cookie）の解決中に、
// 白画面ではなく構造を見せて待ちのブロック感を減らす。ヘッダの行は ToolHeader で描き、
// 読み込み中もモバイルでメニューを開けるようにして、読み込み後に行がずれないようにする。
export const StudioSkeleton: FC = () => (
  <>
    <ToolHeader>
      <div className="bg-bg-mute h-4 w-40 rounded-md motion-safe:animate-pulse" />
      <div className="ml-auto flex items-center gap-2">
        <div className="bg-bg-mute h-8 w-16 rounded-md motion-safe:animate-pulse" />
        <div className="bg-bg-mute h-8 w-16 rounded-md motion-safe:animate-pulse" />
      </div>
    </ToolHeader>
    <div
      aria-busy
      aria-label="読み込み中"
      className="grid min-h-0 flex-1 grid-rows-1 lg:grid-cols-[440px_minmax(0,1fr)]"
    >
      <div className="border-border-mute hidden min-h-0 flex-col gap-5 border-r p-6 lg:flex">
        {range(0, 4).map((n) => (
          <div className="flex flex-col gap-2" key={`studio-msg-skeleton-${n}`}>
            <div className="bg-bg-mute h-3 w-10 rounded-sm motion-safe:animate-pulse" />
            <div className="bg-bg-mute h-16 w-full rounded-lg motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-bg-surface flex min-h-0 items-stretch justify-center p-6">
        <div className="bg-bg-mute size-full rounded-xl motion-safe:animate-pulse" />
      </div>
    </div>
  </>
);
