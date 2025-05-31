import { BlogCard } from './_components/blog-card';
import { Subscribe } from './_components/subscribe';
import { getBlogMetadata, getBlogs } from '#services/blog';

export default async function Page() {
  const blogs = await getBlogs();
  return (
    <div className="relative flex flex-col gap-4">
      {await Promise.all(
        blogs.map(async (blog) => {
          const metadata = await getBlogMetadata(blog.slug);
          return (
            <BlogCard
              key={blog.id}
              slug={blog.slug}
              tags={blog.tags}
              metadata={metadata}
            />
          );
        }),
      )}
      <Subscribe />
    </div>
  );
}
