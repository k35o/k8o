import clsx from 'clsx';
import { FC } from 'react';

export const Separator: FC<{
  orientation?: 'horizontal' | 'vertical';
}> = ({ orientation = 'horizontal' }) => {
  return (
    <div
      className={clsx('bg-borderPrimary', {
        'h-full w-px': orientation === 'vertical',
        'h-px w-full': orientation === 'horizontal',
      })}
    />
  );
};
