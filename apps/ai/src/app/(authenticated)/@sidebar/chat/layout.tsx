import { Suspense } from 'react';
import type { ReactNode } from 'react';

import { listThreadsForRoute } from '@/features/agent/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { ThreadListSlot } from '../../_components/thread-list';
import {
  SidebarListSkeleton,
  SidebarSection,
} from '../../_components/tool-frame';

const Threads = async () => {
  await verifySession();
  const threads = await listThreadsForRoute();
  return <ThreadListSlot threads={threads} />;
};

// スレッドを移っても一覧を作り直さないよう、ページではなく layout に置く。layout は移動で
// 取り直されないので、このタブで触ったスレッドは TouchedThreads が一覧に重ねる
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarSection heading="履歴" newLabel="新しいチャット">
        <Suspense fallback={<SidebarListSkeleton />}>
          <Threads />
        </Suspense>
      </SidebarSection>
      {children}
    </>
  );
}
