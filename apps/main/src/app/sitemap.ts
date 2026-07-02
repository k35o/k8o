import type { MetadataRoute } from 'next';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getSlideContents } from '@/features/slides/interface/queries';
import { getTags } from '@/features/tags/interface/queries';
import { siteEntries } from '@/shared/site/site-entries';

const BASE_URL = 'https://k8o.me';

const latestOf = (dates: readonly string[]): Date | undefined =>
  dates.length === 0
    ? undefined
    : new Date(Math.max(...dates.map((date) => new Date(date).getTime())));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogContents();
  const slides = await getSlideContents();
  const tags = await getTags();

  const latestBlog = latestOf(blogs.map((blog) => blog.updatedAt));
  const latestSlide = latestOf(slides.map((slide) => slide.updatedAt));
  const latestOverall = latestOf([
    ...blogs.map((blog) => blog.updatedAt),
    ...slides.map((slide) => slide.updatedAt),
  ]);

  const blogMap = blogs.map((blog) => ({
    url: `${BASE_URL}/blog/${blog.slug}`,
    lastModified: new Date(blog.updatedAt),
  }));
  const slideMap = slides.map((slide) => ({
    url: `${BASE_URL}/slides/${slide.slug}`,
    lastModified: new Date(slide.updatedAt),
  }));
  const tagMap = tags.map((tag) => ({
    url: `${BASE_URL}/tags/${tag.id.toString()}`,
  }));

  // siteEntries の内部ページ。/blog は changeFrequency を別途指定するため除外。
  const entryMap = siteEntries
    .filter(
      (entry) => !entry.link.startsWith('https://') && entry.link !== '/blog',
    )
    .map((entry) => ({
      url: `${BASE_URL}${entry.link}`,
    }));

  return [
    {
      url: BASE_URL,
      lastModified: latestOverall,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: 'weekly',
      lastModified: latestBlog,
    },
    ...blogMap,
    {
      url: `${BASE_URL}/slides`,
      changeFrequency: 'weekly',
      lastModified: latestSlide,
    },
    ...slideMap,
    {
      url: `${BASE_URL}/tags`,
    },
    ...tagMap,
    ...entryMap,
  ] satisfies MetadataRoute.Sitemap;
}
