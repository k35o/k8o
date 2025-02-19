import * as motion from 'motion/react-client';
import { FC } from 'react';
import { CardProps } from './type';
import clsx from 'clsx';

export const InteractiveCard: FC<
  CardProps & { animation?: 'low' | 'medium' }
> = ({ children, variant = 'primary', animation = 'medium' }) => (
  <motion.section
    whileHover={{ scale: animation === 'medium' ? 1.05 : 1.02 }}
    whileTap={{ scale: animation === 'medium' ? 0.95 : 0.98 }}
    className={clsx(
      'bg-bg-base/90 rounded-lg shadow-md',
      variant === 'primary' && 'bg-bg-base/90',
      variant === 'secondary' && 'bg-bg-mute',
    )}
    tabIndex={-1}
  >
    {children}
  </motion.section>
);
