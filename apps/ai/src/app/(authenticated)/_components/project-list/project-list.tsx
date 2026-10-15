import Link from 'next/link';
import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

import { UpdatedAt } from '../updated-at';

import styles from './project-list.module.css';

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
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <ul className={styles.root}>
      {projects.map((project) => {
        const isCurrent = project.id === currentProjectId;
        return (
          <li key={project.id}>
            <Link
              aria-current={isCurrent ? 'page' : undefined}
              className={styles.item}
              href={`${basePath}?project=${project.id.toString()}`}
              onNavigate={() => {
                onNavigate?.();
              }}
            >
              <span className={styles.title}>{project.title}</span>
              <span className={styles.meta}>
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
