import type { FC } from 'react';

import type { BlogSummary } from '@/features/blog/interface/queries';

import { BlogHeader } from '../blog-header/blog-header';
import { BlogListContent } from '../blog-list-content/blog-list-content';

import styles from './blog-index.module.css';

export const BlogIndex: FC<{ blogs: readonly BlogSummary[] }> = ({ blogs }) => (
  <div className={styles.root}>
    <BlogHeader />
    <BlogListContent blogs={blogs} />
  </div>
);
