'use client';

import { ArteOdysseyProvider } from '@k8o/arte-odyssey/providers';
import { ThemeProvider } from 'next-themes';
import type { FC, PropsWithChildren } from 'react';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <ArteOdysseyProvider>{children}</ArteOdysseyProvider>
    </ThemeProvider>
  );
};
