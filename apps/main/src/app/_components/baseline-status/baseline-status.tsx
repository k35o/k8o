import type { FC } from 'react';

import { getFeatureStatus } from '@/features/baseline/interface/queries';

import { BaselineStatusView } from './baseline-status-view';

// featureId から web-features(ビルド時)の状態を解決して表示する Server Component。
// MDX から `<BaselineStatus featureId="..." />` で使う（mdx-components に登録）。
export const BaselineStatus: FC<{ featureId: string }> = ({ featureId }) => (
  <BaselineStatusView feature={getFeatureStatus(featureId)} />
);
