'use client';

import { Anchor, Stack } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { BrowserOnly } from '@/components/site/browser-only/browser-only';
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
    <Stack gap="lg">
      <BrowserSupportRecentChanges changes={recentChanges} />
      {/* HTML は URL の値を知らずに描くので、一覧は骨組みを置いてブラウザでだけ描く。
          既定の値で描くと、URL の値で開いたときに全件が一度出る */}
      <BrowserOnly fallback={<BrowserSupportFeatureListSkeleton />}>
        <BrowserSupportFeatureList
          blogMap={blogMap}
          currentYear={latestYear}
          features={features}
          nowMs={nowMs}
        />
      </BrowserOnly>
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
    </Stack>
  );
};
