'use client';

import { Anchor } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import { Suspense } from 'react';
import type { FC } from 'react';

import type { BlogLink } from '@/features/blog/interface/queries';
import type { BrowserSupportSnapshot } from '@/features/browser-support/interface/queries';
import { useLiveSnapshot } from '@/shared/api/live-snapshot';
import { publicApi, readOrNull } from '@/shared/api/public-api';

import { BrowserSupportFeatureList } from './browser-support-feature-list';
import { BrowserSupportRecentChanges } from './browser-support-recent-changes';
import { BrowserSupportFeatureListSkeleton } from './skeleton';

import styles from './browser-support-live.module.css';

const loadSnapshot = (): Promise<BrowserSupportSnapshot | null> =>
  readOrNull(publicApi.public['browser-support'].$get());

export const BrowserSupportLive: FC<{
  snapshot: BrowserSupportSnapshot;
  blogMap: Record<string, BlogLink>;
}> = ({ snapshot, blogMap }) => {
  const { meta, features, recentChanges, nowMs } = useLiveSnapshot(
    'browser-support',
    loadSnapshot,
    snapshot,
  );

  if (meta === null) {
    return (
      <p className={styles.syncing}>
        データを同期しています。しばらくしてから再度アクセスしてください。
      </p>
    );
  }

  const latestYear = features[0]?.resolvedDate.slice(0, 4) ?? '';

  return (
    <div className={styles.root}>
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
      <p className={styles.source}>
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
};
