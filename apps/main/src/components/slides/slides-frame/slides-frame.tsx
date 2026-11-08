import { href } from '@k8ordo/framework';
import { Heading, Stack } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import styles from './slides-frame.module.css';

// /slides の枠。layout.tsx に置くと、この CSS をどのページも読むので、
// /slides と /slides/:slug のページが描く
export const SlidesFrame: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.root}>
    <Stack gap="lg">
      <a className={styles.link} href={href('/slides')}>
        <Heading level="h2">Slides</Heading>
      </a>
      {children}
    </Stack>
  </div>
);
