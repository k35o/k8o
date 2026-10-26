import type { FC } from 'react';

import type { getBlogContents } from '@/features/blog/interface/queries';

import { BlogCard } from './blog-card';

import styles from './recent-blogs.module.css';

type RecentBlogsProps = {
  blogs: Awaited<ReturnType<typeof getBlogContents>>;
};

export const RecentBlogs: FC<RecentBlogsProps> = ({ blogs }) => (
  <div className={styles.root}>
    {blogs.map((blog) => (
      <BlogCard key={blog.id} {...blog} />
    ))}
  </div>
);
