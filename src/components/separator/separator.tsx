import { cn } from '@/helpers/cn';
import { FC } from 'react';

export const Separator: FC<{
  orientation?: 'horizontal' | 'vertical';
}> = ({ orientation = 'horizontal' }) => {
  return (
    <div
      className={cn('bg-border-base', {
        'h-full w-px': orientation === 'vertical',
        'h-px w-full': orientation === 'horizontal',
      })}
    />
  );
};
