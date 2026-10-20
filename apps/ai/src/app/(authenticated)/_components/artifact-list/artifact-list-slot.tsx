'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import type { FC } from 'react';

import type { ArtifactListItem } from '@/features/artifacts/interface/queries';

import { useSidebarMenu } from '../tool-frame';
import { ArtifactList } from './artifact-list';

type ArtifactListSlotProps = {
  artifacts: ArtifactListItem[];
};

// @sidebar/artifacts の layout の中で描くので、1つ下のセグメントが開いている生成物の ID になる
export const ArtifactListSlot: FC<ArtifactListSlotProps> = ({ artifacts }) => {
  const { close } = useSidebarMenu();
  return (
    <ArtifactList
      artifacts={artifacts}
      currentArtifactId={useSelectedLayoutSegment()}
      onNavigate={close}
    />
  );
};
