'use client';

import { ColorFilters } from '@/app/_components/color-filters';
import { ToastProvider } from '@/components/toast';
import { MotionConfig } from 'motion/react';
import { ThemeProvider } from 'next-themes';
import { FC, PropsWithChildren } from 'react';
import '@/libs/zod';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <MotionConfig reducedMotion="user">
        <ColorFilters.Provider>
          <ToastProvider>{children}</ToastProvider>
        </ColorFilters.Provider>
      </MotionConfig>
    </ThemeProvider>
  );
};
