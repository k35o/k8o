import type { FC, ReactNode } from 'react';
import { ActivityErrorBoundary } from './activity-error-boundary';

export const SilentErrorBoundary: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <ActivityErrorBoundary fallback={null}>{children}</ActivityErrorBoundary>
  );
};
