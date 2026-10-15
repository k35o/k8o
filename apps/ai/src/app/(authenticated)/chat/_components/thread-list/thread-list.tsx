import { Badge } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';

import { UpdatedAt } from '../../../_components/updated-at';

import styles from './thread-list.module.css';

// 開いた時点で今のスレッドが一覧の下のほうにあっても見えるよう、見える位置へ寄せる
const revealCurrent = (element: HTMLAnchorElement | null): void => {
  element?.scrollIntoView({ block: 'nearest' });
};

type ThreadListProps = {
  threads: ThreadListItem[];
  currentThreadId: string | null;
  onNavigate?: ((thread: ThreadListItem) => void) | undefined;
};

export const ThreadList: FC<ThreadListProps> = ({
  threads,
  currentThreadId,
  onNavigate,
}) => {
  if (threads.length === 0) {
    return (
      <p className={styles.empty}>
        まだ会話はありません。送ると履歴に残ります。
      </p>
    );
  }

  return (
    <ul className={styles.root}>
      {threads.map((thread) => {
        const isCurrent = thread.id === currentThreadId;
        return (
          <li key={thread.id}>
            <Link
              aria-current={isCurrent ? 'page' : undefined}
              className={styles.link}
              href={`/chat/${thread.id}`}
              onNavigate={() => {
                onNavigate?.(thread);
              }}
              ref={isCurrent ? revealCurrent : undefined}
            >
              <span className={styles.title}>{thread.title}</span>
              <span className={styles.meta}>
                <UpdatedAt dateTime={thread.updatedAt} />
                {thread.running ? (
                  <Badge label="生成中" size="sm" tone="info" />
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
