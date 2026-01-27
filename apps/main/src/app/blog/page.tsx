import { getBlogContents } from '@/app/blog/_api';
import { BlogCard } from './_components/blog-card';

export default async function Page() {
  const blogs = await getBlogContents();
  return (
    <div className="relative flex flex-col gap-4">
      {blogs.map((blog) => {
        return <BlogCard key={blog.id} {...blog} />;
      })}
    </div>
  );
}
