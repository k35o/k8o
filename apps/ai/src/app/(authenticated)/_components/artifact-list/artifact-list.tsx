import { Badge } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC } from 'react';

import type { ArtifactListItem } from '@/features/artifacts/interface/queries';

import { ArtifactKindBadge } from '../artifact-kind-badge';
import { UpdatedAt } from '../updated-at';

import styles from './artifact-list.module.css';

// 開いた時点で今の生成物が一覧の下のほうにあっても見えるよう、見える位置へ寄せる
const revealCurrent = (element: HTMLAnchorElement | null): void => {
  element?.scrollIntoView({ block: 'nearest' });
};

type ArtifactListProps = {
  artifacts: ArtifactListItem[];
  currentArtifactId: string | null;
  onNavigate?: (() => void) | undefined;
};

export const ArtifactList: FC<ArtifactListProps> = ({
  artifacts,
  currentArtifactId,
  onNavigate,
}) => {
  if (artifacts.length === 0) {
    return (
      <p className={styles.empty}>
        まだ作ったものはありません。チャットで UI
        やスライドを頼むと、ここに並びます。
      </p>
    );
  }

  return (
    <ul className={styles.root}>
      {artifacts.map((artifact) => {
        const isCurrent = artifact.id === currentArtifactId;
        return (
          <li key={artifact.id}>
            <Link
              aria-current={isCurrent ? 'page' : undefined}
              className={styles.link}
              href={`/artifacts/${artifact.id}`}
              onNavigate={() => {
                onNavigate?.();
              }}
              ref={isCurrent ? revealCurrent : undefined}
            >
              <span className={styles.head}>
                <span className={styles.title}>{artifact.title}</span>
                {artifact.isPublic ? (
                  <Badge label="公開" size="sm" tone="success" />
                ) : null}
              </span>
              <span className={styles.meta}>
                <UpdatedAt dateTime={artifact.updatedAt} />
                <ArtifactKindBadge kind={artifact.kind} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
