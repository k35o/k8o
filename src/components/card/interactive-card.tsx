'use client';

import { motion } from 'motion/react';
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
      'bg-bg-base/55 rounded-xl shadow-md',
      variant === 'primary' && 'bg-bg-base/55',
      variant === 'secondary' && 'bg-bg-secondary',
    )}
  >
    {children}
  </motion.section>
);
