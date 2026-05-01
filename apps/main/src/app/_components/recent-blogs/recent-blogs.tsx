import { Card } from '@k8o/arte-odyssey';
import { cacheLife } from 'next/cache';
import { Suspense } from 'react';

import { getBlogContents } from '@/features/blog/interface/queries';

import { BlogCard } from './blog-card';

const Skeleton = () => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <div className="bg-bg-mute h-6 w-3/4 animate-pulse rounded" />
            <div className="bg-bg-mute h-4 w-full animate-pulse rounded" />
          </div>
          <div className="bg-bg-mute h-4 w-24 animate-pulse rounded" />
        </div>
      </Card>
    ))}
  </div>
);

/**
 * 最近のブログ記事コンポーネント（Server Component）
 */
export const RecentBlogs = () => (
  <Suspense fallback={<Skeleton />}>
    <RecentBlogsContent />
  </Suspense>
);

const RecentBlogsContent = async () => {
  'use cache';
  cacheLife('max');

  const blogs = await getBlogContents();
  const recentBlogs = blogs.slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      {recentBlogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
    </div>
  );
};
