import { Heading } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC } from 'react';

import { WritingModeSwitcher } from '../blog-layout/writing-mode';
import { ExternalBlog } from '../external-blog';

import styles from './blog-header.module.css';

export const BlogHeader: FC = () => (
  <div className={styles.root}>
    <Link className={styles.titleLink} href="/blog">
      <Heading level="h2">Blog</Heading>
    </Link>
    <div className={styles.actions}>
      <WritingModeSwitcher />
      <ExternalBlog />
    </div>
  </div>
);
