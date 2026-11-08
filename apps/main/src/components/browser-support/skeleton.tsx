import { Stack } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './skeleton.module.css';

const ROW_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;

export const BrowserSupportFeatureListSkeleton: FC = () => (
  <section className={styles.root}>
    <Stack gap="md">
      <div className={cn(styles.bone, styles.search)} />
      <div className={styles.toggles}>
        <div className={cn(styles.bone, styles.toggle)} />
        <div className={cn(styles.bone, styles.toggle)} />
        <div className={cn(styles.bone, styles.toggleWide)} />
      </div>
    </Stack>
    <Stack gap="md">
      <div className={cn(styles.bone, styles.tabs)} />
      <ul className={styles.rows}>
        {ROW_KEYS.map((key) => (
          <li className={styles.row} key={key}>
            <div className={cn(styles.bone, styles.badge)} />
            <div className={styles.body}>
              <div className={cn(styles.bone, styles.name)} />
              <div className={cn(styles.bone, styles.featureId)} />
              <div className={cn(styles.bone, styles.support)} />
            </div>
          </li>
        ))}
      </ul>
    </Stack>
  </section>
);
