import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import { ARTIFACT_KIND_LABELS } from '@/features/artifacts/interface/artifact-kind';
import type { ArtifactKind } from '@/features/artifacts/interface/artifact-kind';

type ArtifactKindBadgeProps = {
  kind: ArtifactKind;
};

export const ArtifactKindBadge: FC<ArtifactKindBadgeProps> = ({ kind }) => (
  <Badge label={ARTIFACT_KIND_LABELS[kind]} size="sm" />
);
