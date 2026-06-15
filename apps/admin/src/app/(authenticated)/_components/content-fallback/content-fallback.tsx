import { Spinner } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const ContentFallback: FC = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner label="読み込み中" size="lg" />
  </div>
);
