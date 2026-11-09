import { href } from '@k8ordo/framework';
import { Heading, Stack, TagIcon } from '@k8ordo/ui';
import type { FC } from 'react';

import { TagCard } from '../tag-card/tag-card';

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
  <Stack gap="xl">
    <div className={styles.summary}>
      <div className={styles.icon}>
        <TagIcon />
      </div>
      <Stack gap="sm">
        <Heading level="h3">{name}</Heading>
        <p className={styles.count}>
          {blogs.length + talks.length}
          件のコンテンツがあります
        </p>
      </Stack>
    </div>
    <Stack gap="xl">
      {blogs.length > 0 && (
        <div className={styles.section}>
          <a href={href('/blog')}>
            <Heading level="h4">Blog</Heading>
          </a>
          <div className={styles.grid}>
            {blogs.map((blog) => (
              <TagCard
                href={href('/blog/:slug', { slug: blog.slug })}
                key={blog.id}
                label="ブログを読む"
                title={blog.title}
              />
            ))}
          </div>
        </div>
      )}
      {talks.length > 0 && (
        <div className={styles.section}>
          <a href={href('/talks')}>
            <Heading level="h4">Talks</Heading>
          </a>
          <div className={styles.grid}>
            {talks.map((talk) => (
              <TagCard
                href={href('/talks')}
                key={talk.id}
                label="Talks"
                title={talk.title}
              />
            ))}
          </div>
        </div>
      )}
    </Stack>
  </Stack>
);
