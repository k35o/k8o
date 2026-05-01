import type { FC, ReactNode } from 'react';

import { ActivityErrorBoundary } from './activity-error-boundary';

export const SilentErrorBoundary: FC<{
  children: ReactNode;
}> = ({ children }) => (
  <ActivityErrorBoundary fallback={null}>{children}</ActivityErrorBoundary>
);
