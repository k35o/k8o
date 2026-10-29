import { href } from '@k8ordo/framework';
import { Heading } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import styles from './slides-frame.module.css';

// apps/main では app/slides/layout.tsx が描く枠。layout.tsx に置くと、この CSS をどのページも読むので、
// /slides と /slides/:slug のページが描く
export const SlidesFrame: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.root}>
    <div className={styles.stack}>
      <a className={styles.link} href={href('/slides')}>
        <Heading level="h2">Slides</Heading>
      </a>
      {children}
    </div>
  </div>
);
