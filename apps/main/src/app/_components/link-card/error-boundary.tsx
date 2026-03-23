import { Anchor } from '@k8o/arte-odyssey';
import type { FC, ReactNode } from 'react';
import { ActivityErrorBoundary } from '@/app/_components/error-boundary';

export const LinkCardErrorBoundary: FC<{
  href: string;
  children: ReactNode;
}> = ({ href, children }) => {
  return (
    <ActivityErrorBoundary fallback={<Anchor href={href}>{href}</Anchor>}>
      {children}
    </ActivityErrorBoundary>
  );
};
