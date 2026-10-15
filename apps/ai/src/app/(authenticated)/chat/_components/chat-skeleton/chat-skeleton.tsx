import { range } from '@repo/helpers/array/range';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './chat-skeleton.module.css';

export const ChatSkeleton: FC = () => (
  <div aria-busy aria-label="読み込み中" className={styles.root}>
    <div className={styles.sidebar}>
      <div className={cn(styles.bone, styles.brand)} />
      <div className={cn(styles.bone, styles.newButton)} />
      <div className={styles.nav}>
        {range(0, 3).map((n) => (
          <div
            className={cn(styles.bone, styles.navItem)}
            key={`chat-nav-skeleton-${n}`}
          />
        ))}
      </div>
      <div className={styles.threads}>
        {range(0, 4).map((n) => (
          <div
            className={cn(styles.bone, styles.thread)}
            key={`chat-thread-skeleton-${n}`}
          />
        ))}
      </div>
    </div>
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={cn(styles.bone, styles.title)} />
        <div className={cn(styles.bone, styles.badge)} />
      </div>
      <div className={styles.body}>
        <div className={styles.conversation}>
          <div className={cn(styles.bone, styles.question)} />
          <div className={styles.answer}>
            {range(0, 3).map((n) => (
              <div
                className={cn(styles.bone, styles.line)}
                key={`chat-message-skeleton-${n}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.composer}>
        <div className={cn(styles.bone, styles.input)} />
      </div>
    </div>
  </div>
);
