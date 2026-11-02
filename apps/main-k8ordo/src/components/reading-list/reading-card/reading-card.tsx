import { ExternalLinkIcon, Card, PublishDateIcon } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { ReadingCardBody } from './body';
import { ReadingCardImage } from './image';

import styles from './reading-card.module.css';

// 多層防御: DB に不正なスキームの URL が混入しても javascript: 等をリンク化しない
const isHttpUrl = (value: string): boolean => {
  if (!URL.canParse(value)) {
    return false;
  }
  const { protocol } = new URL(value);
  return protocol === 'https:' || protocol === 'http:';
};

export type ReadingCardProps = {
  url: string;
  title: string;
  publishedAt: string;
  imageUrl: string | null;
  description: string | null;
  summary: string | null;
  sourceTitle: string;
};

export const ReadingCard: FC<ReadingCardProps> = ({
  url,
  title,
  publishedAt,
  imageUrl,
  description,
  summary,
  sourceTitle,
}) => (
  <div className={styles.root}>
    <Card interactive variant="shadow">
      <div className={styles.card}>
        {imageUrl !== null && <ReadingCardImage src={imageUrl} />}
        <div className={styles.body}>
          <div className={styles.heading}>
            <p className={styles.title}>
              {/* タイトルをリンク化し ::after でカード全体を当たり判定にする
                  （空 anchor + aria-label によるタイトルの二重読みを回避） */}
              {isHttpUrl(url) ? (
                <a
                  className={styles.link}
                  href={url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </p>
            <ReadingCardBody description={description} summary={summary} />
          </div>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <PublishDateIcon size="sm" />
              <span>{formatDate(new Date(publishedAt), 'yyyy年M月d日')}</span>
            </div>
            <div className={styles.metaItem}>
              <ExternalLinkIcon size="sm" />
              <p>{sourceTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);
