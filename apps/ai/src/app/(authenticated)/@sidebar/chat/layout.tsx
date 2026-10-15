import { verifySession } from '@repo/auth-shell/verify-session';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

import { listThreadsForRoute } from '@/features/agent/interface/queries';

import {
  SidebarListSkeleton,
  SidebarSection,
} from '../../_components/tool-frame';
import { ThreadListSlot } from '../../chat/_components/thread-list';

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
      <SidebarSection heading="履歴" newHref="/chat" newLabel="新しいチャット">
        <Suspense fallback={<SidebarListSkeleton />}>
          <Threads />
        </Suspense>
      </SidebarSection>
      {children}
    </>
  );
}
