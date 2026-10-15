import { Heading, TagIcon } from '@k8ordo/ui';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import { TagCard } from '../tag-card';

import styles from './tag-content.module.css';

export const TagContent: FC<{
  name: string;
  blogs: Array<{
    id: number;
    slug: string;
    title: string;
  }>;
  talks: Array<{
    id: number;
    title: string;
  }>;
}> = ({ name, blogs, talks }) => (
  <div className={styles.root}>
    <div className={styles.summary}>
      <div className={styles.icon}>
        <TagIcon />
      </div>
      <div className={styles.summaryText}>
        <Heading level="h3">{name}</Heading>
        <p className={styles.count}>
          {blogs.length + talks.length}
          件のコンテンツがあります
        </p>
      </div>
    </div>
    <div className={styles.sections}>
      {blogs.length > 0 && (
        <div className={styles.section}>
          <Link href="/blog">
            <Heading level="h4">Blog</Heading>
          </Link>
          <div className={styles.grid}>
            {blogs.map((blog) => (
              <TagCard
                href={`/blog/${blog.slug}` as Route}
                key={blog.id}
                label="ブログを読む"
                linkLabel={`「${blog.title}」のブログを読む`}
                title={blog.title}
              />
            ))}
          </div>
        </div>
      )}
      {talks.length > 0 && (
        <div className={styles.section}>
          <Link href="/talks">
            <Heading level="h4">Talks</Heading>
          </Link>
          <div className={styles.grid}>
            {talks.map((talk) => (
              <TagCard
                href="/talks"
                key={talk.id}
                label="Talks"
                linkLabel="Talksを開く"
                title={talk.title}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
