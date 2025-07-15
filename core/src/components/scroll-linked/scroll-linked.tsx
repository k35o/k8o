'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { FC } from 'react';

export const ScrollLinked: FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.01,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="bg-primary-fg fixed left-0 right-0 top-0 h-2 origin-left"
    />
  );
};
