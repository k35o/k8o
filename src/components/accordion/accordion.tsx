import { cn } from '@/utils/cn';
import { FC, PropsWithChildren } from 'react';

export const Accordion: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={cn(
        'border-border-secondary bg-bg-base rounded-lg border-2 p-2',
        'focus-within:border-border-transparent focus-within:ring-border-focus focus-within:ring-2 focus-within:outline-hidden',
      )}
    >
      {children}
    </div>
  );
};
