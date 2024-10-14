'use client';

import { ColorFilters } from '@/components/color-filters';
import { ToastProvider } from '@/components/toast';
import { ThemeProvider } from 'next-themes';
import { FC, PropsWithChildren } from 'react';
import '@/libs/zod';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <ColorFilters.Provider>
        <ToastProvider>{children}</ToastProvider>
      </ColorFilters.Provider>
    </ThemeProvider>
  );
};
