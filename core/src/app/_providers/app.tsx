'use client';

import { ColorFilters } from '@/app/_components/color-filters';
import { ComponentProvider } from '@k8o/arte-odyssey/providers';
import { ThemeProvider } from 'next-themes';
import { FC, PropsWithChildren } from 'react';
import '@/libs/zod';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <ComponentProvider>
        <ColorFilters.Provider>{children}</ColorFilters.Provider>
      </ComponentProvider>
    </ThemeProvider>
  );
};
