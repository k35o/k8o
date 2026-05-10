'use client';

import { cn } from '@repo/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

import { useWritingMode } from './writing-mode-context';

/**
 * 縦書きモード時に BlogLayoutContent 全体 (article、フィードバック、関連記事、TOC) を
 * vertical-rl で表示するためのラッパー。
 * 内部に overflow-x: auto を持つので、コンテンツが左に伸びても内部横スクロールで吸収する。
 * Header / Blog 行 / footer 等のグローバル要素は影響を受けない。
 */
export const WritingModeContent: FC<PropsWithChildren> = ({ children }) => {
  const { mode } = useWritingMode();
  return (
    <div
      className={cn(
        mode === 'vertical' &&
          'writing-v bg-bg-base/90 inline-[calc(100svh-8rem)] w-full overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-xl',
      )}
      data-writing-mode={mode}
    >
      {children}
    </div>
  );
};
