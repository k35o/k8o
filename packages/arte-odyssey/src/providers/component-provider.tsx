import { MotionConfig } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { ToastProvider } from '../toast';

export const ComponentProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
};
