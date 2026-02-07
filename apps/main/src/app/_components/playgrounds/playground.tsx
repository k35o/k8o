'use client';

import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
  }>
> = ({ title = 'Playground', children }) => {
  return (
    <motion.div
      className="relative my-8 text-xs sm:text-md"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-48px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="overflow-hidden rounded-sm">
        <div className="flex items-center gap-2.5 bg-primary-base px-4 py-2.5">
          <motion.div
            className="size-2 rotate-45 bg-primary-fg"
            initial={{ scale: 0, rotate: 45 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ scale: 1, rotate: 45 }}
          />
          <p className="font-bold text-primary-fg tracking-wider">{title}</p>
        </div>
        <div className="border-border-base border-x border-b bg-bg-base p-5">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
