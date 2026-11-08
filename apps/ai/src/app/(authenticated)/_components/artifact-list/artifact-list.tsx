import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import type { ArtifactListItem } from '@/features/artifacts/interface/queries';

import { ArtifactKindBadge } from '../artifact-kind-badge';
import { SidebarList } from '../sidebar-list';

type ArtifactListProps = {
  artifacts: ArtifactListItem[];
  currentArtifactId: string | null;
  onNavigate?: (() => void) | undefined;
};

export const ArtifactList: FC<ArtifactListProps> = ({
  artifacts,
  currentArtifactId,
  onNavigate,
}) => (
  <SidebarList
    basePath="/artifacts"
    currentId={currentArtifactId}
    emptyText="まだ作ったものはありません。チャットで UI やスライドを頼むと、ここに並びます。"
    entries={artifacts.map((artifact) => ({
      id: artifact.id,
      title: artifact.title,
      updatedAt: artifact.updatedAt,
      titleBadge: artifact.isPublic ? (
        <Badge label="公開" size="sm" tone="success" />
      ) : null,
      metaBadge: <ArtifactKindBadge kind={artifact.kind} />,
      onNavigate,
    }))}
  />
);
