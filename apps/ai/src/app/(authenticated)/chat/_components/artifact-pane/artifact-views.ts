export type ArtifactView = 'preview' | 'spec' | 'tsx';

export const ARTIFACT_VIEW_OPTIONS = [
  { value: 'preview', label: 'プレビュー' },
  { value: 'spec', label: 'spec' },
  { value: 'tsx', label: 'TSX' },
] as const satisfies ReadonlyArray<{ value: ArtifactView; label: string }>;
