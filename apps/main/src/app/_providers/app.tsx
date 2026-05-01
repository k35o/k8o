'use client';

import { ArteOdysseyProvider } from '@k8o/arte-odyssey';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { FC, PropsWithChildren } from 'react';

import '@/libs/zod';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class">
    <NuqsAdapter>
      <ArteOdysseyProvider>{children}</ArteOdysseyProvider>
    </NuqsAdapter>
  </ThemeProvider>
);
