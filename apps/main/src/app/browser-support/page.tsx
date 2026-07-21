import { Anchor } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { getFeatureBlogMap } from '@/features/blog/interface/queries';
import { getBrowserSupportFeatures } from '@/features/browser-support/interface/queries';

import {
  BrowserSupportFeatureList,
  BrowserSupportFeatureListSkeleton,
} from './_components';

export default async function BrowserSupportPage() {
  const [{ features, nowMs }, blogMap] = await Promise.all([
    getBrowserSupportFeatures(),
    getFeatureBlogMap(),
  ]);

  const latestYear = features[0]?.resolvedDate.slice(0, 4) ?? '';

  return (
    <div className="flex flex-col gap-6">
      {/* nuqs が searchParams（動的データ）を読むため、静的プリレンダリング時は
          Suspense 境界が必要。境界内はリクエスト時にレンダリングされる。 */}
      <Suspense fallback={<BrowserSupportFeatureListSkeleton />}>
        <BrowserSupportFeatureList
          blogMap={blogMap}
          currentYear={latestYear}
          features={features}
          nowMs={nowMs}
        />
      </Suspense>
      <p className="text-fg-mute text-xs">
        Source:{' '}
        <Anchor
          href="https://github.com/web-platform-dx/web-features"
          openInNewTab
        >
          web-features
        </Anchor>
      </p>
    </div>
  );
}
