import { Card } from '@k8o/arte-odyssey/card';
import { cacheLife } from 'next/cache';
import { Suspense } from 'react';
import { getBlogContents } from '@/app/blog/_api';
import { BlogCard } from './blog-card';

const Skeleton = () => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-3/4 animate-pulse rounded bg-bg-mute" />
            <div className="h-4 w-full animate-pulse rounded bg-bg-mute" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-bg-mute" />
        </div>
      </Card>
    ))}
  </div>
);

/**
 * 最近のブログ記事コンポーネント（Server Component）
 */
export const RecentBlogs = () => {
  return (
    <Suspense fallback={<Skeleton />}>
      <RecentBlogsContent />
    </Suspense>
  );
};

const RecentBlogsContent = async () => {
  'use cache';
  cacheLife('days');

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
