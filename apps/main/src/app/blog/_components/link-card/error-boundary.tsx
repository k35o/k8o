import type { FC, ReactNode } from 'react';

import { ActivityErrorBoundary } from '@/app/_components/error-boundary';

import { LinkCardFallback } from './fallback';
import type { LinkCardVariant } from './fallback';

export const LinkCardErrorBoundary: FC<{
  href: string;
  variant?: LinkCardVariant;
  children: ReactNode;
}> = ({ href, variant = 'shadow', children }) => (
  <ActivityErrorBoundary
    fallback={<LinkCardFallback variant={variant} href={href} />}
  >
    {children}
  </ActivityErrorBoundary>
);
