import { getFeatureStatus } from '@/features/browser-support/interface/queries';

import { BrowserSupportStatusView } from './browser-support-status-view';

// featureId から active データセット(DB)の状態を解決して表示する async Server
// Component。MDX から `<BrowserSupportStatus featureId="..." />` で使う
// (mdx-components に登録)。データ未同期時は View が null を受けて何も描画しない。
export const BrowserSupportStatus = async ({
  featureId,
}: {
  featureId: string;
}) => <BrowserSupportStatusView feature={await getFeatureStatus(featureId)} />;
