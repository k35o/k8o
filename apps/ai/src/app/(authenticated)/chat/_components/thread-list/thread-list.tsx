import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';

import { SidebarList } from '../../../_components/sidebar-list';

type ThreadListProps = {
  threads: ThreadListItem[];
  currentThreadId: string | null;
  onNavigate?: ((thread: ThreadListItem) => void) | undefined;
};

export const ThreadList: FC<ThreadListProps> = ({
  threads,
  currentThreadId,
  onNavigate,
}) => (
  <SidebarList
    basePath="/chat"
    currentId={currentThreadId}
    emptyText="まだ会話はありません。送ると履歴に残ります。"
    entries={threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      updatedAt: thread.updatedAt,
      metaBadge: thread.running ? (
        <Badge label="生成中" size="sm" tone="info" />
      ) : null,
      onNavigate: () => {
        onNavigate?.(thread);
      },
    }))}
  />
);
