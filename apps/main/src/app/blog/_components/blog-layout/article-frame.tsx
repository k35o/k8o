'use client';

import { cn } from '@repo/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

import { useWritingMode } from './writing-mode/writing-mode-context';

// xl以上でサイドレール目次が並ぶときだけ、そのぶん本文が狭まらないよう幅を広げる。
// レールが出ない縦書き・見出しなしのときは他ページと同じ幅のまま本文を中央に置く
export const ArticleFrame: FC<PropsWithChildren<{ hasToc: boolean }>> = ({
  hasToc,
  children,
}) => {
  const { mode } = useWritingMode();
  const hasSideRail = hasToc && mode === 'horizontal';

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-col gap-6',
        hasSideRail && 'xl:max-w-7xl',
      )}
    >
      {children}
    </div>
  );
};
