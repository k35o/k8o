import { cn } from '@/utils/cn';
import { FC, PropsWithChildren } from 'react';

export const Accordion: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={cn(
        'border-borderSecondary bg-bgBase rounded-lg border-2 p-2',
        'focus-within:border-borderTransparent focus-within:ring-borderFocus focus-within:ring-2 focus-within:outline-hidden',
      )}
    >
      {children}
    </div>
  );
};
