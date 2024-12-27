import { cn } from '@/utils/cn';
import { FC, PropsWithChildren } from 'react';

export const Accordion: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-borderSecondary bg-bgBase p-2',
        'focus-within:border-borderTransparent focus-within:outline-none focus-within:ring-2 focus-within:ring-borderFocus',
      )}
    >
      {children}
    </div>
  );
};
