import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import { ARTIFACT_KIND_LABELS } from '@/features/artifacts/application/artifact-kind';
import type { ArtifactKind } from '@/features/artifacts/application/artifact-kind';

type ArtifactKindBadgeProps = {
  kind: ArtifactKind;
};

export const ArtifactKindBadge: FC<ArtifactKindBadgeProps> = ({ kind }) => (
  <Badge label={ARTIFACT_KIND_LABELS[kind]} size="sm" />
);
