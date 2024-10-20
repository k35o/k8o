'use client';

import { motion } from 'framer-motion';
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
      'rounded-xl bg-bgBase/55 shadow-md',
      variant === 'primary' && 'bg-bgBase/55',
      variant === 'secondary' && 'bg-bgSecondary',
    )}
  >
    {children}
  </motion.section>
);
