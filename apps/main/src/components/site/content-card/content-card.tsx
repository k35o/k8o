import {
  Badge,
  Heading,
  Card,
  PublishDateIcon,
  TagIcon,
  UpdateDateIcon,
} from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import styles from './content-card.module.css';

type ContentCardProps = {
  href: string;
  headingType: 'h3' | 'h4';
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  readingTime?: number;
};

export const ContentCard: FC<ContentCardProps> = ({
  href,
  headingType,
  tags,
  title,
  description,
  createdAt,
  updatedAt,
  readingTime,
}) => (
  <Card interactive>
    {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- リンクの名前は中の題などの文字が持つ。規則は子を浅くしかたどらず、そこまで届かない */}
    <a className={styles.link} href={href}>
      <div className={styles.root}>
        <div className={styles.heading}>
          <Heading lineClamp={3} level={headingType}>
            {title}
          </Heading>
          {description !== null && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
        <div className={styles.meta}>
          {tags.length > 0 && (
            <div className={styles.tags}>
              <TagIcon size="sm" />
              {tags.map((tag) => (
                <Badge key={tag} size="sm" label={tag} />
              ))}
            </div>
          )}
          <div className={styles.dates}>
            {readingTime !== undefined && (
              <span>約{readingTime}分で読めます</span>
            )}
            <div className={styles.dateRow}>
              <div className={styles.date}>
                <PublishDateIcon size="sm" />
                <span>
                  公開: {formatDate(new Date(createdAt), 'yyyy年M月d日')}
                </span>
              </div>
              <div className={styles.date}>
                <UpdateDateIcon size="sm" />
                <span>
                  更新: {formatDate(new Date(updatedAt), 'yyyy年M月d日')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  </Card>
);
