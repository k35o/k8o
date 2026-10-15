import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import { GENERATION_MODEL_LABELS } from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import styles from './chat-header.module.css';

type ChatHeaderProps = {
  title: string | null;
  model: GenerationModel | null;
};

export const ChatHeader: FC<ChatHeaderProps> = ({ title, model }) => (
  <>
    <h1 className={styles.title}>{title ?? '新しいチャット'}</h1>
    {model === null ? (
      <div className={styles.modelSkeleton} data-skeleton />
    ) : (
      <Badge label={GENERATION_MODEL_LABELS[model]} size="sm" />
    )}
  </>
);
