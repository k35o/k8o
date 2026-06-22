'use client';

import { ArteOdysseyProvider, ToastProvider } from '@k8o/arte-odyssey';
import { ThemeProvider } from 'next-themes';
import type { FC, PropsWithChildren } from 'react';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ArteOdysseyProvider>
      <ToastProvider>{children}</ToastProvider>
    </ArteOdysseyProvider>
  </ThemeProvider>
);
