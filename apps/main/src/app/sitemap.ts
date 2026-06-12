import type { MetadataRoute } from 'next';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getSlideContents } from '@/features/slides/interface/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogContents();
  const slides = await getSlideContents();

  const blogMap = blogs.map((blog) => ({
    url: `https://k8o.me/blog/${blog.slug}`,
  }));
  const slideMap = slides.map((slide) => ({
    url: `https://k8o.me/slides/${slide.slug}`,
  }));

  return [
    {
      url: 'https://k8o.me',
    },
    {
      url: 'https://k8o.me/blog',
      changeFrequency: 'weekly',
    },
    ...blogMap,
    {
      url: 'https://k8o.me/slides',
      changeFrequency: 'weekly',
    },
    ...slideMap,
    {
      url: 'https://k8o.me/base-converter',
    },
    {
      url: 'https://k8o.me/baseline',
    },
    {
      url: 'https://k8o.me/color-converter',
    },
    {
      url: 'https://k8o.me/contrast-checker',
    },
    {
      url: 'https://k8o.me/moji-count',
    },
    {
      url: 'https://k8o.me/qr-generator',
    },
    {
      url: 'https://k8o.me/radius-maker',
    },
    {
      url: 'https://k8o.me/text-diff',
    },
  ] satisfies MetadataRoute.Sitemap;
}
