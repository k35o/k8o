import { Anchor } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import { Suspense } from 'react';

import { getFeatureBlogMap } from '@/features/blog/interface/queries';
import {
  getBrowserSupportFeatures,
  getRecentBrowserSupportChanges,
} from '@/features/browser-support/interface/queries';

import {
  BrowserSupportFeatureList,
  BrowserSupportFeatureListSkeleton,
  BrowserSupportRecentChanges,
} from './_components';

export default async function BrowserSupportPage() {
  const [{ features, nowMs, meta }, blogMap, recentChanges] = await Promise.all(
    [
      getBrowserSupportFeatures(),
      getFeatureBlogMap(),
      getRecentBrowserSupportChanges(),
    ],
  );

  if (meta === null) {
    return (
      <p className="text-fg-mute py-10 text-center text-sm">
        データを同期しています。しばらくしてから再度アクセスしてください。
      </p>
    );
  }

  const latestYear = features[0]?.resolvedDate.slice(0, 4) ?? '';

  return (
    <div className="flex flex-col gap-6">
      <BrowserSupportRecentChanges changes={recentChanges} />
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
      {/* データ基準の常時表示は鮮度の計器を兼ねる: 更新が止まればここの日付が
          古くなり、通知系が全滅していても見れば分かる。 */}
      <p className="text-fg-mute text-xs">
        Source:{' '}
        <Anchor
          href="https://github.com/web-platform-dx/web-features"
          openInNewTab
        >
          web-features
        </Anchor>{' '}
        v{meta.upstreamVersion}（{formatDate(new Date(meta.ingestedAt))} 取得）
      </p>
    </div>
  );
}
