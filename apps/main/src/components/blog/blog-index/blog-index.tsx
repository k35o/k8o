import type { FC } from 'react';

import { BlogHeader } from '../blog-header/blog-header';
import { BlogListContent } from '../blog-list-content/blog-list-content';
import type { BlogSummary } from '../blog-list-content/types';

import styles from './blog-index.module.css';

export const BlogIndex: FC<{ blogs: readonly BlogSummary[] }> = ({ blogs }) => (
  <div className={styles.root}>
    <BlogHeader />
    <BlogListContent blogs={blogs} />
  </div>
);
