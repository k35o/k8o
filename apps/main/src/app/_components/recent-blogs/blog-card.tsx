import { Badge, Heading, Card, PublishDateIcon, TagIcon } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import styles from './blog-card.module.css';

type BlogCardProps = {
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string;
};

export const BlogCard: FC<BlogCardProps> = ({
  slug,
  title,
  description,
  tags,
  createdAt,
}) => (
  <Card interactive>
    <Link className={styles.link} href={`/blog/${slug}` as Route}>
      <div className={styles.root}>
        <div className={styles.heading}>
          <Heading lineClamp={2} level="h3">
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
          <div className={styles.date}>
            <PublishDateIcon size="sm" />
            <span>{formatDate(new Date(createdAt), 'yyyy年M月d日')}</span>
          </div>
        </div>
      </div>
    </Link>
  </Card>
);
