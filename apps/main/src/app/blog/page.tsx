import { Suspense } from 'react';

import { getBlogContents } from '@/features/blog/interface/queries';

import { BlogHeader } from './_components/blog-header';
import {
  BlogListContent,
  BlogListSkeleton,
} from './_components/blog-list-content';

import styles from './page.module.css';

export default async function Page() {
  const blogs = await getBlogContents();

  return (
    <div className={styles.root}>
      <BlogHeader />
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogListContent blogs={blogs} />
      </Suspense>
    </div>
  );
}
