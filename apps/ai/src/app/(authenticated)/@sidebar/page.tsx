import { verifySession } from '@repo/auth-shell/verify-session';
import { Suspense } from 'react';

import { listProjectsForRoute } from '@/features/projects/interface/queries';

import { ProjectListSlot } from '../_components/project-list';
import { SidebarListSkeleton, SidebarSection } from '../_components/tool-frame';

const Projects = async () => {
  await verifySession();
  const projects = await listProjectsForRoute();
  return (
    <ProjectListSlot
      basePath="/"
      emptyText="まだ保存された UI はありません。生成すると自動で履歴に残ります。"
      projects={projects}
    />
  );
};

export default function Page() {
  return (
    <SidebarSection heading="プロジェクト" newHref="/" newLabel="新規作成">
      <Suspense fallback={<SidebarListSkeleton />}>
        <Projects />
      </Suspense>
    </SidebarSection>
  );
}
