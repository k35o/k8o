import type { ArtifactKind } from '@/features/agent/application/chat-artifacts';

export type ArtifactView = 'preview' | 'spec' | 'tsx' | 'markdown';

type ArtifactViewOption = { value: ArtifactView; label: string };

export const ARTIFACT_VIEW_OPTIONS = {
  ui: [
    { value: 'preview', label: 'プレビュー' },
    { value: 'spec', label: 'spec' },
    { value: 'tsx', label: 'TSX' },
  ],
  slides: [
    { value: 'preview', label: 'プレビュー' },
    { value: 'markdown', label: 'Markdown' },
  ],
} as const satisfies Record<ArtifactKind, readonly ArtifactViewOption[]>;

// 選んだビューの state を直さずに描画中に導くので、UI の TSX を見ているあいだにスライドへ追従しても、
// その kind に無いビューはプレビューとして出す
export const artifactViewFor = (
  kind: ArtifactKind,
  view: ArtifactView,
): ArtifactView => {
  const options: readonly ArtifactViewOption[] = ARTIFACT_VIEW_OPTIONS[kind];
  return options.some((option) => option.value === view) ? view : 'preview';
};
