import { ToastProvider } from '@/components/toast';
import { FC, PropsWithChildren } from 'react';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return <ToastProvider>{children}</ToastProvider>;
};
