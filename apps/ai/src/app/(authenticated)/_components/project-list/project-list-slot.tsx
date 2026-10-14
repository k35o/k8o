'use client';

import { useSearchParams } from 'next/navigation';
import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

import { parseProjectId } from '../project-persistence';
import { useSidebarMenu } from '../tool-frame';
import { ProjectList } from './project-list';

type ProjectListSlotProps = {
  projects: ProjectListItem[];
  basePath: '/' | '/slides';
  emptyText: string;
};

export const ProjectListSlot: FC<ProjectListSlotProps> = ({
  projects,
  basePath,
  emptyText,
}) => {
  const { close } = useSidebarMenu();
  const currentProjectId = parseProjectId(useSearchParams().get('project'));
  return (
    <ProjectList
      basePath={basePath}
      currentProjectId={currentProjectId}
      emptyText={emptyText}
      onNavigate={close}
      projects={projects}
    />
  );
};
