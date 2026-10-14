'use client';

import { Button, PlusIcon } from '@k8ordo/ui';
import { SignOutButton } from '@repo/auth-shell/sign-out-button';
import type { FC } from 'react';

import { ToggleTheme } from '@/app/_components/toggle-theme';
import type { ProjectListItem } from '@/features/projects/application/projects';

import { ToolNav } from '../tool-nav';
import type { StudioTool } from '../tool-nav';
import { ProjectList } from './project-list';

export type SidebarContentProps = {
  tool: StudioTool;
  projects: ProjectListItem[];
  currentProjectId: number | null;
  projectsEmptyText?: string | undefined;
  onSelectProject: (projectId: number) => void;
  onNewProject: () => void;
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
}) => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="flex flex-col gap-3 px-3 pt-3">
      <Button
        color="primary"
        onClick={onNewProject}
        size="sm"
        startIcon={<PlusIcon size="sm" />}
        variant="solid"
      >
        新規作成
      </Button>
      <ToolNav current={tool} />
    </div>
    <p className="text-fg-mute px-5 pt-5 pb-1 text-xs font-bold">
      プロジェクト
    </p>
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ProjectList
        currentProjectId={currentProjectId}
        emptyText={projectsEmptyText}
        onSelect={onSelectProject}
        projects={projects}
      />
    </div>
    <div className="flex items-center justify-between px-4 py-3">
      <SignOutButton />
      <ToggleTheme />
    </div>
  </div>
);
