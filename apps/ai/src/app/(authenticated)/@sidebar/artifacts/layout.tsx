import { verifySession } from '@repo/auth-shell/verify-session';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

import { listArtifactsForRoute } from '@/features/artifacts/interface/queries';

import { ArtifactListSlot } from '../../_components/artifact-list';
import {
  SidebarListSkeleton,
  SidebarSection,
} from '../../_components/tool-frame';

const Artifacts = async () => {
  await verifySession();
  const artifacts = await listArtifactsForRoute();
  return <ArtifactListSlot artifacts={artifacts} />;
};

// 生成物を移っても一覧を作り直さないよう、ページではなく layout に置く
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarSection heading="作ったもの" newLabel="チャットで作る">
        <Suspense fallback={<SidebarListSkeleton />}>
          <Artifacts />
        </Suspense>
      </SidebarSection>
      {children}
    </>
  );
}
