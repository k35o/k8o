import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import type { BlogSummary } from '../../_utils/types';
import { BlogCard } from '../blog-card';

import styles from './year-section.module.css';

type Props = {
  year: number;
  blogs: readonly BlogSummary[];
};

export const YearSection: FC<Props> = ({ year, blogs }) => (
  <section className={styles.root}>
    <Heading level="h3">{year}年</Heading>
    <div className={styles.list}>
      {blogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
    </div>
  </section>
);
