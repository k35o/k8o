import { Spinner } from '@k8o/arte-odyssey';
import type { FC } from 'react';

// コンテンツ Suspense のフォールバック（静的シェルは即時表示し、本体のみストリーミング）
export const ContentFallback: FC = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner label="読み込み中" size="lg" />
  </div>
);
