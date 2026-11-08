import { Stack } from '@k8ordo/ui';
import type { FC } from 'react';

import type { getBlogContents } from '@/features/blog/interface/queries';

import { BlogCard } from './blog-card';

type RecentBlogsProps = {
  blogs: Awaited<ReturnType<typeof getBlogContents>>;
};

export const RecentBlogs: FC<RecentBlogsProps> = ({ blogs }) => (
  <Stack gap="md">
    {blogs.map((blog) => (
      <BlogCard key={blog.id} {...blog} />
    ))}
  </Stack>
);
