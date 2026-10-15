'use client';

import { Button, PlusIcon } from '@k8ordo/ui';
import { SignOutButton } from '@repo/auth-shell/sign-out-button';
import type { FC } from 'react';

import { ToggleTheme } from '@/app/_components/toggle-theme';
import type { ProjectListItem } from '@/features/projects/application/projects';

import { ToolNav } from '../tool-nav';
import type { StudioTool } from '../tool-nav';
import { ProjectList } from './project-list';

import styles from './sidebar-content.module.css';

export type SidebarContentProps = {
  tool: StudioTool;
  projects: ProjectListItem[];
  currentProjectId: number | null;
  projectsEmptyText?: string | undefined;
  onSelectProject: (projectId: number) => void;
  onNewProject: () => void;
  onNavigate?: (() => void) | undefined;
};

// サイドバーの中身。デスクトップの常設 aside とモバイルの Drawer の両方に入る。
// ツール切替（ナビ）とプロジェクト履歴・新規作成をここへ集約する。
export const SidebarContent: FC<SidebarContentProps> = ({
  tool,
  projects,
  currentProjectId,
  projectsEmptyText,
  onSelectProject,
  onNewProject,
  onNavigate,
}) => (
  <div className={styles.root}>
    <div className={styles.top}>
      <Button
        color="primary"
        onClick={onNewProject}
        size="sm"
        startIcon={<PlusIcon size="sm" />}
        variant="solid"
      >
        新規作成
      </Button>
      <ToolNav current={tool} onNavigate={onNavigate} />
    </div>
    <p className={styles.heading}>プロジェクト</p>
    <div className={styles.list}>
      <ProjectList
        currentProjectId={currentProjectId}
        emptyText={projectsEmptyText}
        onSelect={onSelectProject}
        projects={projects}
      />
    </div>
    <div className={styles.footer}>
      <SignOutButton />
      <ToggleTheme />
    </div>
  </div>
);
