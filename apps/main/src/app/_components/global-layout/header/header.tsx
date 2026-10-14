'use client';

import type { FC, ReactNode } from 'react';

import { useIsScrollingDown } from './use-is-scrolling-down';

export const Header: FC<{ children: ReactNode }> = ({ children }) => {
  const isScrollingDown = useIsScrollingDown();

  return (
    <header
      // focus-within: キーボードでヘッダー内コントロールへ移動したら常に表示する
      // (WCAG 2.4.11)。motion-reduce: 動きの抑制設定を尊重する
      className={`sticky top-0 z-50 flex items-center justify-center p-4 transition-transform duration-300 focus-within:translate-y-0 motion-reduce:transition-none ${
        isScrollingDown ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="bg-bg-base/60 flex w-full max-w-5xl items-center justify-between rounded-full px-8 py-2 shadow-md backdrop-blur-md">
        {children}
      </div>
    </header>
  );
};
