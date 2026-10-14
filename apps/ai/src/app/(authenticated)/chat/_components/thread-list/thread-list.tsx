import { Badge } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import Link from 'next/link';
import type { FC } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';

import { UpdatedAt } from '../../../_components/updated-at';

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
      <p className="text-fg-mute p-4 text-sm leading-relaxed">
        まだ会話はありません。送ると履歴に残ります。
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 p-2">
      {threads.map((thread) => {
        const isCurrent = thread.id === currentThreadId;
        return (
          <li key={thread.id}>
            <Link
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'flex flex-col gap-1 rounded-xl px-4 py-3 transition-colors duration-150',
                isCurrent ? 'bg-primary-bg-subtle' : 'hover:bg-bg-mute',
              )}
              href={`/chat/${thread.id}`}
              onNavigate={() => {
                onNavigate?.();
              }}
              ref={isCurrent ? revealCurrent : undefined}
            >
              <span className="text-fg-base truncate text-sm font-bold">
                {thread.title}
              </span>
              <span className="text-fg-mute flex items-center gap-2 text-xs">
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
