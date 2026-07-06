import type { Metadata } from 'next';

import { getBlogContent } from './queries';

const BLOG_URL = 'https://k8o.me/blog';

export const buildBlogMetadata = async (slug: string): Promise<Metadata> => {
  const blog = await getBlogContent(slug);

  return {
    title: blog.title,
    description: blog.description,
    category: blog.tags.map((tag) => tag.name).join(', '),
    alternates: {
      canonical: `/blog/${slug}`,
      types: {
        'application/rss+xml': `${BLOG_URL}/feed`,
      },
    },
    openGraph: {
      title: blog.title,
      description: blog.description ?? undefined,
      url: `${BLOG_URL}/${slug}`,
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: blog.title,
      card: 'summary_large_image',
      description: blog.description ?? undefined,
    },
  };
};
