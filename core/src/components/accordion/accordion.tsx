import { cn } from '@k8o/helpers/cn';
import { FC, PropsWithChildren } from 'react';

export const Accordion: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={cn(
        'border-border-mute bg-bg-base rounded-md border-2 p-2',
        'focus-within:bordertransparent focus-within:ring-border-info focus-within:outline-hidden focus-within:ring-2',
      )}
    >
      {children}
    </div>
  );
};
