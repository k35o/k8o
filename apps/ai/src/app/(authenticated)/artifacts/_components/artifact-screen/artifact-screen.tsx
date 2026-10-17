'use client';

import type { FC } from 'react';

import { DeckHighlightContext } from '@/app/_components/slide-deck';
import type { LoadedArtifact } from '@/features/artifacts/interface/queries';
import { highlightGenerated } from '@/features/highlight/interface/actions';

import { useDeckHighlight } from '../../../_components/deck-highlight';
import { ArtifactDetail } from '../artifact-detail';

type ArtifactScreenProps = {
  artifact: LoadedArtifact;
};

export const ArtifactScreen: FC<ArtifactScreenProps> = ({ artifact }) => (
  <DeckHighlightContext value={useDeckHighlight()}>
    <ArtifactDetail artifact={artifact} highlight={highlightGenerated} />
  </DeckHighlightContext>
);
