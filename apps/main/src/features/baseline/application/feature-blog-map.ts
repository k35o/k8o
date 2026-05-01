import { getBlogMetadata } from '@/features/blog/application/blog';
import { getBlogs } from '@/features/blog/application/blogs';

export type BlogLink = {
  slug: string;
  title: string;
};

export async function getFeatureBlogMap(): Promise<Record<string, BlogLink>> {
  const blogs = await getBlogs();
  const map: Record<string, BlogLink> = {};

  await Promise.all(
    blogs.map(async (blog) => {
      const metadata = await getBlogMetadata(blog.slug);
      if (!metadata.featureIds) return;
      for (const featureId of metadata.featureIds) {
        map[featureId] = { slug: blog.slug, title: metadata.title };
      }
    }),
  );

  return map;
}
