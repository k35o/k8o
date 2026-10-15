import { Card } from '@k8ordo/ui';
import { range } from '@repo/helpers/array/range';
import { cn } from '@repo/helpers/cn';
import { Suspense } from 'react';

import { getBlogContents } from '@/features/blog/interface/queries';

import { BlogCard } from './blog-card';

import styles from './recent-blogs.module.css';

const Skeleton = () => (
  <div className={styles.root}>
    {range(0, 3).map((n) => (
      <Card key={`recent-blog-skeleton-${n}`}>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonText}>
            <div className={cn(styles.bone, styles.boneTitle)} />
            <div className={cn(styles.bone, styles.boneDescription)} />
          </div>
          <div className={cn(styles.bone, styles.boneDate)} />
        </div>
      </Card>
    ))}
  </div>
);

export const RecentBlogs = () => (
  <Suspense fallback={<Skeleton />}>
    <RecentBlogsContent />
  </Suspense>
);

const RecentBlogsContent = async () => {
  const blogs = await getBlogContents();
  const recentBlogs = blogs.slice(0, 3);

  return (
    <div className={styles.root}>
      {recentBlogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
    </div>
  );
};
