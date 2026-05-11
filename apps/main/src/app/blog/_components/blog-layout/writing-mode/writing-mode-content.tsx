'use client';

import { cn } from '@repo/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

import { useWritingMode } from './writing-mode-context';

export const WritingModeContent: FC<PropsWithChildren> = ({ children }) => {
  const { mode } = useWritingMode();
  return (
    <div
      className={cn(
        mode === 'vertical' &&
          'writing-v bg-bg-base/90 inline-[calc(100svh-8rem)] w-full min-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-xl',
      )}
    >
      {children}
    </div>
  );
};
