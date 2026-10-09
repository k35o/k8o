import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

export const ReadingCardSummary: FC<{ summary: string }> = ({ summary }) => (
  <div className="flex flex-col gap-1">
    <span className="self-start">
      <Badge size="sm" label="AI要約" tone="info" />
    </span>
    <p className="text-fg-mute text-sm">{summary}</p>
  </div>
);
