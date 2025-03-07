import { FC } from 'react';
import { CardProps } from './type';
import { cn } from '@/utils/cn';

export const Card: FC<CardProps> = ({
  children,
  variant = 'primary',
}) => (
  <section
    className={cn(
      'bg-bg-base/90 rounded-lg shadow-md',
      variant === 'primary' && 'bg-bg-base/90',
      variant === 'secondary' && 'bg-bg-mute',
    )}
  >
    {children}
  </section>
);
