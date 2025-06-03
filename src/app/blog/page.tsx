import { BlogCard } from './_components/blog-card';
import { Subscribe } from './_components/subscribe';
import { getBlogContents } from '#api/blog';

export default async function Page() {
  const blogs = await getBlogContents();
  return (
    <div className="relative flex flex-col gap-4">
      {blogs.map((blog) => {
        return <BlogCard key={blog.id} {...blog} />;
      })}
      <Subscribe />
    </div>
  );
}
