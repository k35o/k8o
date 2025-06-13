import { cn } from '@/helpers/cn';
import { FC, PropsWithChildren } from 'react';

export const Accordion: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={cn(
        'border-border-mute bg-bg-base rounded-md border-2 p-2',
        'focus-within:bordertransparent focus-within:ring-border-info focus-within:ring-2 focus-within:outline-hidden',
      )}
    >
      {children}
    </div>
  );
};
