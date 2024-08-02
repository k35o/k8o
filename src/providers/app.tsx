'use client';

import { ToastProvider } from '@/components/toast';
import { FC, PropsWithChildren } from 'react';
import '@/libs/zod';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return <ToastProvider>{children}</ToastProvider>;
};
