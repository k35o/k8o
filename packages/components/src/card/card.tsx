import { CardProps } from './type';
import { cn } from '@k8o/helpers/cn';
import { FC } from 'react';

export const Card: FC<CardProps> = ({
  children,
  variant = 'primary',
  title,
  width = 'full',
}) => (
  <section
    className={cn(
      'bg-bg-base/90 rounded-lg shadow-md',
      width === 'full' && 'w-full',
      width === 'fit' && 'w-fit',
      variant === 'primary' && 'bg-bg-base/90',
      variant === 'secondary' && 'bg-bg-mute',
    )}
  >
    {title && (
      <div className="from-primary-bg-mute to-secondary-bg-mute flex justify-center rounded-t-lg bg-linear-60 p-4">
        <p className="text-xl font-bold">{title}</p>
      </div>
    )}
    {children}
  </section>
);
