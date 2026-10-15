import { range } from '@repo/helpers/array/range';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import { ToolHeader } from '../../../_components/tool-frame';
import { ChatHeader } from '../chat-view';
import type { OpeningThread } from '../opening-thread';

import styles from './chat-skeleton.module.css';

type ChatSkeletonProps = {
  thread: OpeningThread | null;
};

export const ChatSkeleton: FC<ChatSkeletonProps> = ({ thread }) => (
  <>
    <ToolHeader>
      {thread === null ? (
        <>
          <div className={cn(styles.bone, styles.title)} data-skeleton />
          <div className={cn(styles.bone, styles.badge)} data-skeleton />
        </>
      ) : (
        <ChatHeader model={thread.model} title={thread.title} />
      )}
    </ToolHeader>
    <div
      aria-busy
      aria-label="読み込み中"
      className={styles.root}
      role="status"
    >
      <div className={styles.body}>
        <div className={styles.conversation}>
          <div className={cn(styles.bone, styles.question)} data-skeleton />
          <div className={styles.answer}>
            {range(0, 3).map((n) => (
              <div
                className={cn(styles.bone, styles.line)}
                data-skeleton
                key={`chat-message-skeleton-${n}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.composer}>
        <div className={cn(styles.bone, styles.input)} data-skeleton />
      </div>
    </div>
  </>
);
