'use client';

import { Button, PaletteIcon, PlusIcon, SlideIcon } from '@k8o/arte-odyssey';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { ToggleTheme } from '@/app/_components/toggle-theme';
import type { ProjectListItem } from '@/features/projects/application/projects';

import { ProjectList } from './project-list';

type StudioTool = 'ui' | 'slides';

const TOOLS: Array<{
  tool: StudioTool;
  href: '/' | '/slides';
  label: string;
  icon: ReactNode;
}> = [
  { tool: 'ui', href: '/', label: 'UI', icon: <PaletteIcon size="sm" /> },
  {
    tool: 'slides',
    href: '/slides',
    label: 'スライド',
    icon: <SlideIcon size="sm" />,
  },
];

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
      <nav aria-label="AI ツール" className="flex flex-col gap-1">
        {TOOLS.map((item) =>
          item.tool === tool ? (
            // 現在地。自己遷移すると ?project= が落ちるため無効化しつつ、
            // 読み上げのために Link + aria-current のまま残す。
            <Link
              aria-current="page"
              className="bg-primary-bg-subtle text-primary-fg pointer-events-none flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold"
              href={item.href}
              key={item.tool}
              tabIndex={-1}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <Link
              className="text-fg-mute hover:bg-bg-mute hover:text-fg-base flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150"
              href={item.href}
              key={item.tool}
            >
              {item.icon}
              {item.label}
            </Link>
          ),
        )}
      </nav>
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
    <div className="flex items-center justify-end px-4 py-3">
      <ToggleTheme />
    </div>
  </div>
);
