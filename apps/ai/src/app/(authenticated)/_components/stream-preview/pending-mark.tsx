import { Skeleton } from '@k8o/arte-odyssey';
import type { FC } from 'react';

// 未受信の先端を表すスケルトン。生成が進むとこの位置に実コンテンツが入る。
export const PendingMark: FC = () => (
  <output aria-label="生成中" className="flex flex-col gap-2 py-1">
    <Skeleton shape="rect" size="md" />
  </output>
);
