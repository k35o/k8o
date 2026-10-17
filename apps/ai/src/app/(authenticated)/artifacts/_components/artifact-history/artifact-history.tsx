'use client';

import { Anchor } from '@k8ordo/ui';
import Link, { useLinkStatus } from 'next/link';
import { useId } from 'react';
import type { FC } from 'react';

import type { LoadedArtifact } from '@/features/artifacts/interface/queries';

import { UpdatedAt } from '../../../_components/updated-at';

import styles from './artifact-history.module.css';

type ArtifactHistoryProps = {
  artifactId: string;
  versions: LoadedArtifact['versions'];
  selectedVersion: number;
};

// useLinkStatus は Link の子孫でしか読めないので、行の Link の中に目印を置き、行の見た目は CSS で変える
const PendingMark: FC = () => {
  const { pending } = useLinkStatus();
  return <span className={styles.pendingMark} data-pending={pending} />;
};

export const ArtifactHistory: FC<ArtifactHistoryProps> = ({
  artifactId,
  versions,
  selectedVersion,
}) => {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={styles.root}>
      <h2 className={styles.heading} id={headingId}>
        版の履歴
      </h2>
      <ol className={styles.list}>
        {versions.map((version) => {
          const isSelected = version.version === selectedVersion;
          const label = `版 ${version.version.toString()}`;
          return (
            <li
              className={styles.item}
              data-selected={isSelected}
              key={version.version}
            >
              <Link
                aria-current={isSelected ? 'page' : undefined}
                className={styles.link}
                href={`/artifacts/${artifactId}?v=${version.version.toString()}`}
                scroll={false}
              >
                <span className={styles.head}>
                  <span className={styles.version}>{label}</span>
                  {version.origin.type === 'edit' ? (
                    <span className={styles.origin}>
                      版 {version.origin.version.toString()} から
                    </span>
                  ) : null}
                  <span className={styles.date}>
                    <UpdatedAt dateTime={version.createdAt} />
                  </span>
                </span>
                {version.instruction === '' ? null : (
                  <span className={styles.instruction}>
                    {version.instruction}
                  </span>
                )}
                <PendingMark />
              </Link>
              {isSelected && version.summary !== '' ? (
                <p className={styles.summary}>{version.summary}</p>
              ) : null}
              {version.threadId === null ? null : (
                // 行のリンクの中に入れ子にできないので、兄弟に置く
                <div className={styles.thread}>
                  <Anchor
                    aria-label={`${label}を作った会話を開く`}
                    href={`/chat/${version.threadId}`}
                    renderAnchor={({
                      href,
                      className,
                      children,
                      'aria-label': ariaLabel,
                    }) => (
                      <Link
                        aria-label={ariaLabel}
                        className={className}
                        href={href}
                      >
                        {children}
                      </Link>
                    )}
                  >
                    会話を開く
                  </Anchor>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
