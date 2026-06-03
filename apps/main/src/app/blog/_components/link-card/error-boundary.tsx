import type { FC, ReactNode } from 'react';

import { ActivityErrorBoundary } from '@/app/_components/error-boundary';

import { type LinkCardAppearance, LinkCardFallback } from './fallback';

export const LinkCardErrorBoundary: FC<{
  href: string;
  appearance?: LinkCardAppearance;
  children: ReactNode;
}> = ({ href, appearance = 'shadow', children }) => (
  <ActivityErrorBoundary
    fallback={<LinkCardFallback appearance={appearance} href={href} />}
  >
    {children}
  </ActivityErrorBoundary>
);
