import { cn } from '@k8o/helpers/cn';
import { FC } from 'react';

export const Separator: FC<{
  orientation?: 'horizontal' | 'vertical';
}> = ({ orientation = 'horizontal' }) => {
  const isVertical = orientation === 'vertical';
  const Element = isVertical ? 'div' : 'hr';
  return (
    <Element
      role={isVertical ? 'separator' : undefined}
      aria-orientation={isVertical ? 'vertical' : undefined}
      className={cn('bg-border-base', {
        'h-full w-px': isVertical,
        'h-px w-full': !isVertical,
      })}
    />
  );
};
