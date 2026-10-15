'use client';

import { usePathname } from 'next/navigation';
import type { FC } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';
import { withTouchedThreads } from '@/features/agent/application/touched-threads';

import { useSidebarMenu } from '../../../_components/tool-frame';
import { useOpeningThread } from '../opening-thread';
import { useTouchedThreads } from '../touched-threads';
import { threadIdFromPathname } from './thread-id-from-pathname';
import { ThreadList } from './thread-list';

type ThreadListSlotProps = {
  threads: ThreadListItem[];
};

export const ThreadListSlot: FC<ThreadListSlotProps> = ({ threads }) => {
  const { close } = useSidebarMenu();
  const { threads: touched } = useTouchedThreads();
  const { open } = useOpeningThread();
  // useParams や useSelectedLayoutSegment はルーターの木を読み、/chat で作ったスレッドを
  // replaceState で URL に出したあとも /chat のままなので、URL を映す usePathname で決める
  const currentThreadId = threadIdFromPathname(usePathname());
  return (
    <ThreadList
      currentThreadId={currentThreadId}
      onNavigate={(thread) => {
        close();
        // 今の会話を選んでも、待ちの表示は出ず会話も表示し直されないので、開こうとしている会話にすると外れずに残る
        if (thread.id !== currentThreadId) {
          open(thread);
        }
      }}
      threads={withTouchedThreads(threads, touched)}
    />
  );
};
