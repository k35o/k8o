'use client';

import { ArteOdysseyProvider } from '@k8o/arte-odyssey/providers';
import { ThemeProvider } from 'next-themes';
import type { FC, PropsWithChildren } from 'react';
import { ColorFilters } from '@/app/_components/color-filters';
import '@/libs/zod';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <ArteOdysseyProvider>
        <ColorFilters.Provider>{children}</ColorFilters.Provider>
      </ArteOdysseyProvider>
    </ThemeProvider>
  );
};
