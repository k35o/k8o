import { Badge } from '@k8o/arte-odyssey';
import type { FC } from 'react';

// AI 要約の表示（AI 生成だと分かるラベル＋全文）。SSR・クライアント双方から使う
export const ReadingCardSummary: FC<{ summary: string }> = ({ summary }) => (
  <div className="flex flex-col gap-1">
    <span className="self-start">
      <Badge size="sm" text="AI要約" tone="info" />
    </span>
    <p className="text-fg-mute text-sm">{summary}</p>
  </div>
);
