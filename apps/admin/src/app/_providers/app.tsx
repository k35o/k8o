'use client';

import { ToastProvider, UIProvider } from '@k8ordo/ui';
import { ThemeProvider } from 'next-themes';
import type { FC, PropsWithChildren } from 'react';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class">
    <UIProvider>
      <ToastProvider>{children}</ToastProvider>
    </UIProvider>
  </ThemeProvider>
);
