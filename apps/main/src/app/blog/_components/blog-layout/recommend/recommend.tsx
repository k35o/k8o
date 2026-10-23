import { Badge, Heading, Card, PublishDateIcon, TagIcon } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import type { getBlogsByTags } from '@/features/blog/interface/queries';

import styles from './recommend.module.css';

type RecommendProps = {
  blogs: Awaited<ReturnType<typeof getBlogsByTags>>;
};

export const Recommend: FC<RecommendProps> = ({ blogs }) => {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <Heading level="h3">関連記事</Heading>
      <div className={styles.grid}>
        {blogs.map((blog) => (
          <Card interactive key={blog.id}>
            <Link href={`/blog/${blog.slug}` as Route}>
              <div className={styles.card}>
                <Heading level="h4">{blog.title}</Heading>
                <div className={styles.details}>
                  <div className={styles.tags}>
                    <TagIcon size="sm" />
                    {blog.tags.map((tag) => (
                      <Badge key={tag} size="sm" label={tag} />
                    ))}
                  </div>
                  <div className={styles.date}>
                    <PublishDateIcon size="sm" />
                    <span>
                      公開:{' '}
                      {formatDate(new Date(blog.createdAt), 'yyyy年M月d日')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};
