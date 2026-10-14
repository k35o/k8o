import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

import { UpdatedAt } from '../updated-at';

type ProjectListProps = {
  projects: ProjectListItem[];
  currentProjectId: number | null;
  emptyText?: string | undefined;
  onSelect: (projectId: number) => void;
};

export const ProjectList: FC<ProjectListProps> = ({
  projects,
  currentProjectId,
  emptyText = 'まだ保存された UI はありません。生成すると自動で履歴に残ります。',
  onSelect,
}) => {
  if (projects.length === 0) {
    return (
      <p className="text-fg-mute p-4 text-sm leading-relaxed">{emptyText}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 p-2">
      {projects.map((project) => (
        <li key={project.id}>
          <button
            className={`flex w-full flex-col gap-0.5 rounded-xl px-4 py-3 text-left transition-colors duration-150 ${
              project.id === currentProjectId
                ? 'bg-primary-bg-subtle'
                : 'hover:bg-bg-subtle'
            }`}
            onClick={() => {
              onSelect(project.id);
            }}
            type="button"
          >
            <span className="text-fg-base truncate text-sm font-bold">
              {project.title}
            </span>
            <span className="text-fg-mute text-xs">
              <UpdatedAt dateTime={project.updatedAt} />
              {project.visibility === 'public' ? ' · 公開' : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
