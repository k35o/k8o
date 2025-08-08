import { cn } from '@k8o/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

export const Accordion: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={cn(
        'rounded-md border-2 border-border-mute bg-bg-base p-2',
        'focus-within:bordertransparent focus-within:outline-hidden focus-within:ring-2 focus-within:ring-border-info',
      )}
    >
      {children}
    </div>
  );
};
