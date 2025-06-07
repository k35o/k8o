'use client';

import { useWritingModeValue } from '../toggle-writing-mode';
import { cn } from '@k8o/helpers/cn';
import { FC, PropsWithChildren } from 'react';

export const BlogCardList: FC<PropsWithChildren> = ({ children }) => {
  const writingMode = useWritingModeValue();
  return (
    <div
      className={cn(
        'relative flex gap-4',
        writingMode === 'vertical-rl'
          ? 'flex-row-reverse flex-nowrap overflow-x-scroll md:flex-wrap'
          : 'flex-col',
      )}
    >
      {children}
    </div>
  );
};
