import { getBlogContents } from '@/features/blog/interface/queries';

import { BlogCard } from './_components/blog-card';

export default async function Page() {
  const blogs = await getBlogContents();
  return (
    <div className="relative flex flex-col gap-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
    </div>
  );
}
