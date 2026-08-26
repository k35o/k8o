import type { FC } from 'react';

type ProjectTitleProps = {
  // 読込中に先行表示するプロジェクト名（クリックが効いたことを示す）。
  pendingTitle: string | null;
  projectId: number | null;
  projectTitle: string | null;
  // プロジェクト未選択時に出すツール別のラベル（例: 新しいプロジェクト）。
  newProjectLabel: string;
};

// ヘッダ左端の作業中プロジェクト名。読込中 → 未選択 → 選択中の順に出し分ける。
export const ProjectTitle: FC<ProjectTitleProps> = ({
  pendingTitle,
  projectId,
  projectTitle,
  newProjectLabel,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    {pendingTitle === null ? (
      projectId === null ? (
        <span className="text-fg-mute truncate text-sm">{newProjectLabel}</span>
      ) : (
        <span className="text-fg-base truncate text-sm font-medium">
          {projectTitle ?? '無題'}
        </span>
      )
    ) : (
      <span className="text-fg-base truncate text-sm font-medium">
        {pendingTitle}
      </span>
    )}
  </div>
);
