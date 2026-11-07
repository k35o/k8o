'use client';

import type { FC } from 'react';

import type { BrowserSupportFeature } from '@/features/browser-support/interface/queries';
import { useLiveSnapshot } from '@/shared/api/live-snapshot';
import { publicApi, readOrNull } from '@/shared/api/public-api';

import { BrowserSupportStatusView } from './browser-support-status-view';

const loadFeature = async (
  featureId: string,
): Promise<BrowserSupportFeature | null> => {
  const body = await readOrNull(
    publicApi.public['browser-support'].features[':featureId'].$get({
      param: { featureId },
    }),
  );
  return body?.feature ?? null;
};

export const BrowserSupportStatusLive: FC<{
  featureId: string;
  feature: BrowserSupportFeature | null;
}> = ({ featureId, feature }) => {
  const latest = useLiveSnapshot(
    `browser-support/features/${featureId}`,
    () => loadFeature(featureId),
    feature,
  );
  return <BrowserSupportStatusView feature={latest} />;
};
