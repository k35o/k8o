import { Suspense } from 'react';

import { getBlogContents } from '@/features/blog/interface/queries';

import { BlogHeader } from './_components/blog-header';
import {
  BlogListContent,
  BlogListSkeleton,
} from './_components/blog-list-content';

export default async function Page() {
  const blogs = await getBlogContents();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <BlogHeader />
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogListContent blogs={blogs} />
      </Suspense>
    </div>
  );
}
