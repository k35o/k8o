'use client';

import type { FC } from 'react';

import { DeckHighlightContext } from '@/app/_components/slide-deck';
import {
  changeSharedVersionAction,
  publishArtifactVersionAction,
  unpublishArtifactAction,
} from '@/features/artifacts/interface/actions';
import type { ArtifactForRoute } from '@/features/artifacts/interface/queries';
import { highlightGenerated } from '@/features/highlight/interface/actions';

import { useDeckHighlight } from '../../../_components/deck-highlight';
import { ArtifactDetail } from '../artifact-detail';
import type { ArtifactShareActions } from '../artifact-share-menu';

const SHARE_ACTIONS: ArtifactShareActions = {
  publish: publishArtifactVersionAction,
  changeVersion: changeSharedVersionAction,
  unpublish: unpublishArtifactAction,
};

type ArtifactScreenProps = {
  artifact: ArtifactForRoute;
};

export const ArtifactScreen: FC<ArtifactScreenProps> = ({ artifact }) => (
  <DeckHighlightContext value={useDeckHighlight()}>
    <ArtifactDetail
      artifact={artifact}
      highlight={highlightGenerated}
      shareActions={SHARE_ACTIONS}
    />
  </DeckHighlightContext>
);
