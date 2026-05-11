'use client';

import { cn } from '@repo/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

import { useWritingMode } from './writing-mode-context';

export const WritingModeContent: FC<PropsWithChildren> = ({ children }) => {
  const { mode } = useWritingMode();
  const isVertical = mode === 'vertical';
  return (
    <div
      aria-label={isVertical ? '縦書き本文' : undefined}
      className={cn(
        isVertical &&
          'writing-v bg-bg-base/90 inline-[calc(100svh-8rem)] w-full min-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-xl',
      )}
      role={isVertical ? 'region' : undefined}
      tabIndex={isVertical ? 0 : undefined}
    >
      {children}
    </div>
  );
};
