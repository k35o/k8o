import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { WritingModeSwitcher } from '../blog-layout/writing-mode/writing-mode-switcher';
import { ExternalBlog } from '../external-blog/external-blog';

import styles from './blog-header.module.css';

export const BlogHeader: FC = () => (
  <div className={styles.root}>
    <a className={styles.titleLink} href="/blog">
      <Heading level="h2">Blog</Heading>
    </a>
    <div className={styles.actions}>
      <WritingModeSwitcher />
      <ExternalBlog />
    </div>
  </div>
);
