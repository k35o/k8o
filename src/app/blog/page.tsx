import { getBlogs } from './_actions';
import { BlogCard } from './_components/blog-card';

export default async function Page() {
  const blogs = await getBlogs();
  return (
    <div className="flex flex-col gap-4">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          link={`/blog/${blog.slug}`}
          {...blog}
        />
      ))}
    </div>
  );
}
