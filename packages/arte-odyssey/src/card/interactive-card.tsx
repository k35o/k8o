import { cn } from '@k8o/helpers/cn';
import * as motion from 'motion/react-client';
import type { FC } from 'react';
import type { CardProps } from './type';

export const InteractiveCard: FC<CardProps> = ({
  children,
  variant = 'primary',
  width = 'full',
  title,
}) => (
  <motion.section
    className={cn(
      'rounded-lg bg-bg-base/90 shadow-md',
      width === 'full' && 'w-full',
      width === 'fit' && 'w-fit',
      variant === 'primary' && 'bg-bg-base/90',
      variant === 'secondary' && 'bg-bg-mute',
    )}
    tabIndex={-1}
    whileHover={{
      scale: 1.02,
    }}
    whileTap={{
      scale: 0.98,
    }}
  >
    {title && (
      <div className="flex justify-center rounded-t-lg bg-linear-60 from-primary-bg-mute to-secondary-bg-mute p-4">
        <p className="font-bold text-xl">{title}</p>
      </div>
    )}
    {children}
  </motion.section>
);
