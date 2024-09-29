import { FC } from 'react';
import { CardProps } from './type';
import clsx from 'clsx';

export const Card: FC<CardProps> = ({
  children,
  variant = 'primary',
}) => (
  <section
    className={clsx(
      'rounded-xl bg-bgBase/55 shadow-md',
      variant === 'primary' && 'bg-bgBase/55',
      variant === 'secondary' && 'bg-bgSecondary',
    )}
  >
    {children}
  </section>
);
