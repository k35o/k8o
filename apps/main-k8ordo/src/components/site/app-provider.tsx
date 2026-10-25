'use client';

import '@/i18n';
import { UIProvider } from '@k8ordo/ui';
import type { FC, PropsWithChildren } from 'react';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => (
  <UIProvider>{children}</UIProvider>
);
