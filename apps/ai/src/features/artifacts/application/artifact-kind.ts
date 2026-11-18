import type { Spec } from '@json-render/core';

export type ArtifactContent =
  | { kind: 'ui'; spec: Spec }
  | { kind: 'slides'; source: string };

export type ArtifactKind = ArtifactContent['kind'];

/** 生成の途中や、中身が届く前に止まった生成物の中身。届いていなければ null */
export type PartialArtifactContent =
  | { kind: 'ui'; spec: Spec | null }
  | { kind: 'slides'; source: string | null };

export const ARTIFACT_KIND_LABELS = {
  ui: 'UI',
  slides: 'スライド',
} as const satisfies Record<ArtifactKind, string>;
