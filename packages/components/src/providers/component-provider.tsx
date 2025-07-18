import { ToastProvider } from '../toast';
import { MotionConfig } from 'motion/react';
import { FC, PropsWithChildren } from 'react';

export const ComponentProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
};
