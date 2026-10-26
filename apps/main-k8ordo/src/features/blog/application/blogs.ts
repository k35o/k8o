import { findPublishedBlogRows } from '../infrastructure/blog-repository';
import { findBlogMetadata } from './blog';

export const getBlogs = async () => {
  const blogRows = await findPublishedBlogRows();
  const blogs = await Promise.all(
    blogRows.map(async (blog) => {
      const metadata = await findBlogMetadata(blog.slug);
      if (metadata === null) {
        return null;
      }
      return {
        id: blog.id,
        slug: blog.slug,
        tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      };
    }),
  );
  return blogs.filter((blog) => blog !== null);
};
