import { getFeatureStatus } from '@/features/browser-support/interface/queries';

import { BrowserSupportStatusLive } from './browser-support-status-live';

export const BrowserSupportStatus = async ({
  featureId,
}: {
  featureId: string;
}) => (
  <BrowserSupportStatusLive
    feature={await getFeatureStatus(featureId)}
    featureId={featureId}
  />
);
