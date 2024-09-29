'use client';

import { motion } from 'framer-motion';
import { FC } from 'react';
import { CardProps } from './type';
import clsx from 'clsx';

export const InteractiveCard: FC<CardProps> = ({
  children,
  variant = 'primary',
}) => (
  <motion.section
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={clsx(
      'rounded-xl bg-bgBase/55 shadow-md',
      variant === 'primary' && 'bg-bgBase/55',
      variant === 'secondary' && 'bg-bgSecondary',
    )}
  >
    {children}
  </motion.section>
);
