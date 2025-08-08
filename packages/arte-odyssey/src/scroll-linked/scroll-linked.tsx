'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import type { FC } from 'react';

export const ScrollLinked: FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.01,
  });

  return (
    <motion.div
      className="fixed top-0 right-0 left-0 h-2 origin-left bg-primary-fg"
      style={{ scaleX }}
    />
  );
};
