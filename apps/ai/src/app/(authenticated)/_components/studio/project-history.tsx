import { Drawer } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

import { ProjectList } from './project-list';

type ProjectHistoryProps = {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectListItem[];
  currentProjectId: number | null;
  emptyText?: string;
  onSelect: (projectId: number) => void;
};

export const ProjectHistory: FC<ProjectHistoryProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  emptyText,
  onSelect,
}) => (
  <Drawer isOpen={isOpen} onClose={onClose} side="left" title="履歴">
    <ProjectList
      currentProjectId={currentProjectId}
      emptyText={emptyText}
      onSelect={onSelect}
      projects={projects}
    />
  </Drawer>
);
