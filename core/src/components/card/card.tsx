import { CardProps } from './type';
import { cn } from '@k8o/helpers/cn';
import { FC } from 'react';

export const Card: FC<CardProps> = ({
  children,
  variant = 'primary',
  title,
  width = 'full',
  height = 'full',
}) => (
  <section
    className={cn(
      'bg-bg-base/90 rounded-lg shadow-md',
      width === 'full' && 'w-full',
      width === 'fit' && 'w-fit',
      height === 'full' && 'h-full',
      height === 'fit' && 'h-fit',
      variant === 'primary' && 'bg-bg-base/90',
      variant === 'secondary' && 'bg-bg-mute',
    )}
  >
    {title && (
      <div className="from-primary-bg-mute to-secondary-bg-mute bg-linear-60 flex justify-center rounded-t-lg p-4">
        <p className="text-xl font-bold">{title}</p>
      </div>
    )}
    {children}
  </section>
);
