import { FC } from 'react';
import { CardProps } from './type';
import clsx from 'clsx';

export const Card: FC<CardProps> = ({
  children,
  variant = 'primary',
}) => (
  <section
    className={clsx(
      'bg-bg-base/55 rounded-xl shadow-md',
      variant === 'primary' && 'bg-bg-base/55',
      variant === 'secondary' && 'bg-bg-secondary',
    )}
  >
    {children}
  </section>
);
