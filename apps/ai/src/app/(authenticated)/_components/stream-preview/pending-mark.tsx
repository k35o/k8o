import type { FC } from 'react';

// 未受信の先端を表すスケルトン。arte の Skeleton は固定幅（rect=w-40 等）で小さく見えるため、
// ここでは同じトークン（bg-bg-mute）で幅いっぱいのコンテンツブロック風プレースホルダを組む。
// 生成が進むとこの位置に実コンテンツが入る。
export const PendingMark: FC = () => (
  <output aria-label="生成中" className="flex w-full flex-col gap-2.5 py-2">
    <div className="bg-bg-mute h-5 w-1/2 animate-pulse rounded-md" />
    <div className="bg-bg-mute h-4 w-full animate-pulse rounded-md" />
    <div className="bg-bg-mute h-4 w-5/6 animate-pulse rounded-md" />
  </output>
);
