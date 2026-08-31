'use client';

import { UIProvider } from '@k8ordo/ui';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { FC, PropsWithChildren } from 'react';

import { configureZod } from '@/shared/validation/zod';

configureZod();

export const AppProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider attribute="class">
    <NuqsAdapter>
      <UIProvider>{children}</UIProvider>
    </NuqsAdapter>
  </ThemeProvider>
);
