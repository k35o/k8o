import { Badge } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';

import styles from './thread-list.module.css';

// サーバー（UTC）とブラウザで同じ文字列にしないとハイドレーションがずれるので、時刻帯を固定する
const updatedAtFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// スレッドを移るたびに一覧は作り直され、スクロールが先頭に戻るので、今いるスレッドを見える位置へ寄せる
const revealCurrent = (element: HTMLAnchorElement | null): void => {
  element?.scrollIntoView({ block: 'nearest' });
};

type ThreadListProps = {
  threads: ThreadListItem[];
  currentThreadId: string;
  onNavigate?: (() => void) | undefined;
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
                onNavigate?.();
              }}
              ref={isCurrent ? revealCurrent : undefined}
            >
              <span className={styles.title}>{thread.title}</span>
              <span className={styles.meta}>
                <time dateTime={thread.updatedAt}>
                  {updatedAtFormat.format(new Date(thread.updatedAt))}
                </time>
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
