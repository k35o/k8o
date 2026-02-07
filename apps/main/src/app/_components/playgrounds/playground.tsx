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
      <div className="group relative overflow-hidden rounded-sm border border-border-base transition-colors duration-300 hover:border-primary">
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

        <div className="pointer-events-none absolute top-0 right-0 overflow-hidden">
          <div className="size-6 translate-x-3 -translate-y-3 rotate-45 bg-primary opacity-[0.07]" />
        </div>

        <div className="flex items-center gap-2.5 border-border-base border-b bg-bg-mute py-2.5 pr-4 pl-5">
          <div className="size-2 rotate-45 bg-primary" />
          <p className="font-bold text-fg-base tracking-wider">{title}</p>
        </div>

        <div className="bg-bg-base p-4 pl-5">{children}</div>
      </div>
    </motion.div>
  );
};
