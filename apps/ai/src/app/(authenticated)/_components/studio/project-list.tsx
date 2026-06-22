import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

type ProjectListProps = {
  projects: ProjectListItem[];
  currentProjectId: number | null;
  onSelect: (projectId: number) => void;
};

const pad = (n: number): string => String(n).padStart(2, '0');

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 履歴の一覧（presentational）。Drawer 等の器は呼び出し側が持つ。
export const ProjectList: FC<ProjectListProps> = ({
  projects,
  currentProjectId,
  onSelect,
}) => {
  if (projects.length === 0) {
    return (
      <p className="text-fg-mute p-4 text-sm leading-relaxed">
        まだ保存された UI はありません。生成すると自動で履歴に残ります。
      </p>
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
              {formatDate(project.updatedAt)}
              {project.visibility === 'public' ? ' · 公開' : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
