import { Heading, Stack } from '@k8ordo/ui';
import type { FC } from 'react';

import { BlogCard } from '../blog-card/blog-card';
import type { BlogSummary } from './types';

import styles from './year-section.module.css';

type Props = {
  year: number;
  blogs: readonly BlogSummary[];
};

export const YearSection: FC<Props> = ({ year, blogs }) => (
  <section className={styles.root}>
    <Heading level="h3">{year}年</Heading>
    <Stack gap="md">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
    </Stack>
  </section>
);
