'use client';

import { ToastProvider, UIProvider } from '@k8ordo/ui';
import { ThemeProvider } from 'next-themes';
import type { FC, PropsWithChildren } from 'react';

// ui の組み込み文言はこの集合のロケールで描かれるので、ブラウザでも読み込まれる場所に置く
import '@/i18n';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <UIProvider>
      <ToastProvider>{children}</ToastProvider>
    </UIProvider>
  </ThemeProvider>
);
