import type { MetadataRoute } from 'next';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getSlideContents } from '@/features/slides/interface/queries';
import { getTags } from '@/features/tags/interface/queries';
import { siteEntries } from '@/shared/site/site-entries';

const BASE_URL = 'https://k8o.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogContents();
  const slides = await getSlideContents();
  const tags = await getTags();

  const blogMap = blogs.map((blog) => ({
    url: `${BASE_URL}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
  }));
  const slideMap = slides.map((slide) => ({
    url: `${BASE_URL}/slides/${slide.slug}`,
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
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: 'weekly',
    },
    ...blogMap,
    {
      url: `${BASE_URL}/slides`,
      changeFrequency: 'weekly',
    },
    ...slideMap,
    {
      url: `${BASE_URL}/tags`,
    },
    ...tagMap,
    ...entryMap,
  ] satisfies MetadataRoute.Sitemap;
}
