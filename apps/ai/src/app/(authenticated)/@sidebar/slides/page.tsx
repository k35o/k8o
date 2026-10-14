import { verifySession } from '@repo/auth-shell/verify-session';
import { Suspense } from 'react';

import { listSlidesProjectsForRoute } from '@/features/projects/interface/queries';

import { ProjectListSlot } from '../../_components/project-list';
import {
  SidebarListSkeleton,
  SidebarSection,
} from '../../_components/tool-frame';

const SlidesProjects = async () => {
  await verifySession();
  const projects = await listSlidesProjectsForRoute();
  return (
    <ProjectListSlot
      basePath="/slides"
      emptyText="まだ保存されたスライドはありません。生成すると自動で履歴に残ります。"
      projects={projects}
    />
  );
};

export default function Page() {
  return (
    <SidebarSection
      heading="プロジェクト"
      newHref="/slides"
      newLabel="新規作成"
    >
      <Suspense fallback={<SidebarListSkeleton />}>
        <SlidesProjects />
      </Suspense>
    </SidebarSection>
  );
}
