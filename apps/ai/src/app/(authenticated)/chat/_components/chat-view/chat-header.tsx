import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import { GENERATION_MODEL_LABELS } from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

type ChatHeaderProps = {
  title: string | null;
  model: GenerationModel | null;
};

export const ChatHeader: FC<ChatHeaderProps> = ({ title, model }) => (
  <>
    <h1 className="text-fg-base min-w-0 flex-1 truncate text-sm font-bold">
      {title ?? '新しいチャット'}
    </h1>
    {model === null ? (
      <div className="bg-bg-mute h-5 w-20 rounded-md motion-safe:animate-pulse" />
    ) : (
      <Badge label={GENERATION_MODEL_LABELS[model]} size="sm" />
    )}
  </>
);
