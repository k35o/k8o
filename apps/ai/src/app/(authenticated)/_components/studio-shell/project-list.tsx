import type { FC } from 'react';

import type { ProjectListItem } from '@/features/projects/application/projects';

import styles from './project-list.module.css';

type ProjectListProps = {
  projects: ProjectListItem[];
  currentProjectId: number | null;
  emptyText?: string | undefined;
  onSelect: (projectId: number) => void;
};

const pad = (n: number): string => String(n).padStart(2, '0');

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const ProjectList: FC<ProjectListProps> = ({
  projects,
  currentProjectId,
  emptyText = 'まだ保存された UI はありません。生成すると自動で履歴に残ります。',
  onSelect,
}) => {
  if (projects.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <ul className={styles.root}>
      {projects.map((project) => (
        <li key={project.id}>
          <button
            aria-current={project.id === currentProjectId ? 'true' : undefined}
            className={styles.item}
            onClick={() => {
              onSelect(project.id);
            }}
            type="button"
          >
            <span className={styles.title}>{project.title}</span>
            <span className={styles.meta}>
              {formatDate(project.updatedAt)}
              {project.visibility === 'public' ? ' · 公開' : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
