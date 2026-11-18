import { href } from '@k8ordo/framework';
import { Heading, Stack } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import styles from './deck-frame.module.css';

// /talks/:slug の枠。layout.tsx に置くと、この CSS をどのページも読むので、ページが描く
export const DeckFrame: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.root}>
    <Stack gap="lg">
      <a className={styles.link} href={href('/talks')}>
        <Heading level="h2">Talks</Heading>
      </a>
      {children}
    </Stack>
  </div>
);
