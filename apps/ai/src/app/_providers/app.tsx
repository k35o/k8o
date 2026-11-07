'use client';

import { ToastProvider, UIProvider } from '@k8ordo/ui';
import { ThemeProvider } from 'next-themes';
import type { FC, PropsWithChildren } from 'react';

// ui の組み込み文言はこの集合のロケールで描かれるので、ブラウザでも読み込まれる場所に置く
import '@/i18n';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => (
  // color-scheme は @k8ordo/ui の CSS が class から決める。next-themes に inline で書かせると、
  // ui が印刷で light に戻す規則より強くなる
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableColorScheme={false}
    enableSystem
  >
    <UIProvider>
      <ToastProvider>{children}</ToastProvider>
    </UIProvider>
  </ThemeProvider>
);
