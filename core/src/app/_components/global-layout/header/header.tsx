'use client';

import { useScrollDirection } from '@k8o/arte-odyssey/hooks/scroll-direction';
import type { FC, ReactNode } from 'react';

export const Header: FC<{ children: ReactNode }> = ({ children }) => {
  const scrollDirection = useScrollDirection();

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-center p-4 transition-transform duration-300 ${
        scrollDirection.y === 'down' ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex w-full max-w-5xl items-center justify-between rounded-full bg-bg-base/60 px-8 py-2 shadow-md backdrop-blur-md">
        {children}
      </div>
    </header>
  );
};
