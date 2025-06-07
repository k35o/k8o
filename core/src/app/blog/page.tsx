import { BlogCard, BlogCardList } from './_components/blog-card';
import { Subscribe } from './_components/subscribe';
import { getBlogContents } from '#api/blog';

export default async function Page() {
  const blogs = await getBlogContents();
  return (
    <div className="relative">
      <BlogCardList>
        {blogs.map((blog) => {
          return <BlogCard key={blog.id} {...blog} />;
        })}
      </BlogCardList>
      <Subscribe />
    </div>
  );
}
