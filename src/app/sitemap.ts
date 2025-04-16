import { getBlogs } from '#services/blog';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogs();

  const blogMap = blogs.map((blog) => {
    return {
      url: `https://k8o.me/blog/${blog.slug}`,
      changeFrequency: 'weekly',
    } satisfies MetadataRoute.Sitemap[number];
  });

  return [
    {
      url: 'https://k8o.me',
    },
    {
      url: 'https://k8o.me/blog',
    },
    ...blogMap,
    {
      url: 'https://k8o.me/base-converter',
    },
    {
      url: 'https://k8o.me/color-converter',
    },
    {
      url: 'https://k8o.me/contrast-checker',
    },
    {
      url: 'https://k8o.me/design-system',
    },
    {
      url: 'https://k8o.me/japanese-text-fixer',
    },
    {
      url: 'https://k8o.me/moji-count',
    },
    {
      url: 'https://k8o.me/quizzes',
    },
    {
      url: 'https://k8o.me/radius-maker',
    },
    {
      url: 'https://k8o.me/sql-table-builder',
    },
  ] satisfies MetadataRoute.Sitemap;
}
