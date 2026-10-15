import { Badge, Button, Card, PaletteIcon, Spinner } from '@k8ordo/ui';
import type { FC, Ref } from 'react';

import type { UiArtifactView } from '@/features/agent/application/ui-artifacts';

import styles from './ui-artifact-card.module.css';

const OPEN_LABELS = {
  preview: 'プレビューを開く',
  partial: '途中までを見る',
} as const;

type UiArtifactCardProps = {
  artifact: UiArtifactView;
  isActive: boolean;
  onOpen: () => void;
  buttonRef?: Ref<HTMLButtonElement> | undefined;
};

export const UiArtifactCard: FC<UiArtifactCardProps> = ({
  artifact,
  isActive,
  onOpen,
  buttonRef,
}) => (
  <Card variant="outline">
    <div className={styles.body}>
      <div className={styles.heading}>
        <span className={styles.icon}>
          <PaletteIcon size="sm" />
        </span>
        <p className={styles.title}>{artifact.title}</p>
        {artifact.state === 'done' ? (
          <Badge label={`版 ${artifact.version.toString()}`} size="sm" />
        ) : null}
      </div>
      {artifact.state === 'generating' && artifact.editingVersion !== null ? (
        <p className={styles.note}>
          版 {artifact.editingVersion.toString()} を直しています
        </p>
      ) : null}
      {artifact.state === 'generating' ? (
        <p className={styles.progress}>
          <Spinner label={artifact.text} size="sm" />
          <span aria-hidden>{artifact.text}</span>
        </p>
      ) : artifact.text === '' ? null : (
        <p className={styles.text} data-state={artifact.state}>
          {artifact.text}
        </p>
      )}
      {artifact.open === null ? null : (
        <div className={styles.actions}>
          <Button
            color="base"
            isActive={isActive}
            onClick={onOpen}
            ref={buttonRef}
            size="sm"
            variant="outline"
          >
            {isActive ? (
              // xl 未満では、カードが見えているあいだペインは隠れているので、表示中とは出さずに開く口にする
              <>
                <span className={styles.shownLabel}>表示中</span>
                <span className={styles.openLabel}>
                  {OPEN_LABELS[artifact.open]}
                </span>
              </>
            ) : (
              OPEN_LABELS[artifact.open]
            )}
          </Button>
        </div>
      )}
    </div>
  </Card>
);
