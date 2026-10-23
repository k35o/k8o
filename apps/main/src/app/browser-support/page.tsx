import { getFeatureBlogMap } from '@/features/blog/interface/queries';
import { getBrowserSupportSnapshot } from '@/features/browser-support/interface/queries';

import { BrowserSupportLive } from './_components';

export default async function BrowserSupportPage() {
  const [snapshot, blogMap] = await Promise.all([
    getBrowserSupportSnapshot(),
    getFeatureBlogMap(),
  ]);

  return <BrowserSupportLive blogMap={blogMap} snapshot={snapshot} />;
}
