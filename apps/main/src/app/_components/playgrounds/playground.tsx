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
      <div className="mb-2 flex items-center gap-3">
        <motion.div
          className="size-2 rotate-45 bg-primary"
          initial={{ scale: 0, rotate: 45 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={{ scale: 1, rotate: 45 }}
        />
        <span className="font-bold text-fg-base tracking-wider">{title}</span>
        <motion.div
          className="h-px flex-1 bg-primary opacity-30"
          initial={{ scaleX: 0 }}
          style={{ transformOrigin: 'left' }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ once: true }}
          whileInView={{ scaleX: 1 }}
        />
      </div>

      <div className="group relative overflow-hidden rounded-sm border border-border-base bg-bg-base transition-colors duration-300 hover:border-primary">
        <motion.div
          className="absolute inset-y-0 left-0 w-1 bg-primary"
          initial={{ scaleY: 0 }}
          style={{ transformOrigin: 'top' }}
          transition={{
            duration: 0.5,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ once: true }}
          whileInView={{ scaleY: 1 }}
        />
        <div className="p-4 pl-5">{children}</div>
      </div>
    </motion.div>
  );
};
