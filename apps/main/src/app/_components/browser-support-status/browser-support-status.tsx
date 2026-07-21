import type { FC } from 'react';

import { getFeatureStatus } from '@/features/browser-support/interface/queries';

import { BrowserSupportStatusView } from './browser-support-status-view';

// featureId から web-features(ビルド時)の状態を解決して表示する Server Component。
// MDX から `<BrowserSupportStatus featureId="..." />` で使う（mdx-components に登録）。
export const BrowserSupportStatus: FC<{ featureId: string }> = ({
  featureId,
}) => <BrowserSupportStatusView feature={getFeatureStatus(featureId)} />;
