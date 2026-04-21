import { cn } from '@repo/helpers/cn';
import type { FC, ReactNode } from 'react';

type Width = 'narrow' | 'default' | 'wide' | 'full';

const widthClasses: Record<Width, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

export const ContentContainer: FC<{
  children: ReactNode;
  width?: Width;
  className?: string;
}> = ({ children, width = 'default', className }) => {
  return (
    <div className={cn('mx-auto w-full', widthClasses[width], className)}>
      {children}
    </div>
  );
};
