import { Suspense } from 'react';

import { getBlogContents } from '@/features/blog/interface/queries';

import {
  BlogListContent,
  BlogListSkeleton,
} from './_components/blog-list-content';

export default async function Page() {
  const blogs = await getBlogContents();

  return (
    <Suspense fallback={<BlogListSkeleton />}>
      <BlogListContent blogs={blogs} />
    </Suspense>
  );
}
