import { Spinner } from '@k8o/arte-odyssey';
import type { FC } from 'react';

/**
 * コンテンツ Suspense のフォールバック。
 * 静的シェル（PageHeader 等）は即時表示し、データ依存の本体だけを
 * この Spinner で穴埋めしてストリーミングする。
 */
export const ContentFallback: FC = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner label="読み込み中" size="lg" />
  </div>
);
