import { CardProps } from './type';
import { cn } from '@k8o/helpers/cn';
import * as motion from 'motion/react-client';
import { FC } from 'react';

export const InteractiveCard: FC<CardProps> = ({
  children,
  variant = 'primary',
  width = 'full',
  title,
}) => (
  <motion.section
    whileHover={{
      scale: 1.02,
    }}
    whileTap={{
      scale: 0.98,
    }}
    className={cn(
      'bg-bg-base/90 rounded-lg shadow-md',
      width === 'full' && 'w-full',
      width === 'fit' && 'w-fit',
      variant === 'primary' && 'bg-bg-base/90',
      variant === 'secondary' && 'bg-bg-mute',
    )}
    tabIndex={-1}
  >
    {title && (
      <div className="from-primary-bg-mute to-secondary-bg-mute bg-linear-60 flex justify-center rounded-t-lg p-4">
        <p className="text-xl font-bold">{title}</p>
      </div>
    )}
    {children}
  </motion.section>
);
