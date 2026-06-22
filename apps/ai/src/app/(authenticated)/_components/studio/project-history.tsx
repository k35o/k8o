import { Drawer } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

import { ProjectList } from './project-list';

type ProjectHistoryProps = {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectListItem[];
  currentProjectId: number | null;
  onSelect: (projectId: number) => void;
};

// 履歴のスライドオーバー。一覧描画は ProjectList に委ねる。
export const ProjectHistory: FC<ProjectHistoryProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelect,
}) => (
  <Drawer isOpen={isOpen} onClose={onClose} side="left" title="履歴">
    <ProjectList
      currentProjectId={currentProjectId}
      onSelect={onSelect}
      projects={projects}
    />
  </Drawer>
);
