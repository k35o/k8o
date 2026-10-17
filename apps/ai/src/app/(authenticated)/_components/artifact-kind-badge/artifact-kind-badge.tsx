import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import type { ArtifactKind } from '@/features/agent/application/chat-artifacts';

const KIND_LABELS = {
  ui: 'UI',
  slides: 'スライド',
} as const satisfies Record<ArtifactKind, string>;

type ArtifactKindBadgeProps = {
  kind: ArtifactKind;
};

export const ArtifactKindBadge: FC<ArtifactKindBadgeProps> = ({ kind }) => (
  <Badge label={KIND_LABELS[kind]} size="sm" />
);
