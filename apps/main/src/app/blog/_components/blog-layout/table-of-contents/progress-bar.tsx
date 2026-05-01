import { type FC, useMemo } from 'react';

import { calculateTocPercentage } from '@/shared/mdx/calculate-toc-percentage';
import type { HeadingTree } from '@/shared/mdx/types';

import { END_OF_CONTENT_ID } from '../constants';

export const ProgressBar: FC<{
  activeId: string;
  headingTree: HeadingTree;
}> = ({ activeId, headingTree }) => {
  const currentPercentage = useMemo(() => {
    if (activeId === END_OF_CONTENT_ID) {
      return 100;
    }
    return calculateTocPercentage(activeId, headingTree);
  }, [activeId, headingTree]);
  // SVG円形プログレスバーの計算
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - currentPercentage / 100);

  return (
    <div className="relative size-8 shrink-0">
      <svg
        aria-hidden="true"
        className="size-full -rotate-90"
        viewBox="0 0 32 32"
      >
        {/* 背景の円 */}
        <circle
          cx="16"
          cy="16"
          fill="none"
          r={radius}
          stroke="var(--bg-raised)"
          strokeWidth="3"
        />
        {/* 進捗の円 */}
        <circle
          className="transition-[stroke-dashoffset] duration-500 ease-in-out"
          cx="16"
          cy="16"
          fill="none"
          r={radius}
          stroke="var(--primary-bg)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth="3"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs">
        {currentPercentage}
      </div>
    </div>
  );
};
