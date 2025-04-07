import { BlogCard } from './_components/blog-card';
import { getBlogs } from '#services/blog';

export default async function Page() {
  const blogs = await getBlogs();
  return (
    <div className="flex flex-col gap-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} slug={blog.slug} tags={blog.tags} />
      ))}
    </div>
  );
}
