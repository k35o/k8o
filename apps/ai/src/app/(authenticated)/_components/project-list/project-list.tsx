import { cn } from '@repo/helpers/cn';
import Link from 'next/link';
import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

import { UpdatedAt } from '../updated-at';

type ProjectListProps = {
  projects: ProjectListItem[];
  basePath: '/' | '/slides';
  currentProjectId: number | null;
  emptyText?: string | undefined;
  onNavigate?: (() => void) | undefined;
};

export const ProjectList: FC<ProjectListProps> = ({
  projects,
  basePath,
  currentProjectId,
  emptyText = 'まだ保存された UI はありません。生成すると自動で履歴に残ります。',
  onNavigate,
}) => {
  if (projects.length === 0) {
    return (
      <p className="text-fg-mute p-4 text-sm leading-relaxed">{emptyText}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 p-2">
      {projects.map((project) => {
        const isCurrent = project.id === currentProjectId;
        return (
          <li key={project.id}>
            <Link
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'flex flex-col gap-0.5 rounded-xl px-4 py-3 transition-colors duration-150',
                isCurrent ? 'bg-primary-bg-subtle' : 'hover:bg-bg-subtle',
              )}
              href={`${basePath}?project=${project.id.toString()}`}
              onNavigate={() => {
                onNavigate?.();
              }}
            >
              <span className="text-fg-base truncate text-sm font-bold">
                {project.title}
              </span>
              <span className="text-fg-mute text-xs">
                <UpdatedAt dateTime={project.updatedAt} />
                {project.visibility === 'public' ? ' · 公開' : ''}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
