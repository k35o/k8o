import { metadata } from '../layout';
import { getBlogMetadata, getBlogs } from '#services/blog';
import { NextResponse } from 'next/server';
import RSS from 'rss';

export const dynamic = 'force-static';

const BLOG_URL = 'https://k8o.me/blog';

export async function GET() {
  const feed = new RSS({
    title: metadata.title,
    description: metadata.description,
    feed_url: `${BLOG_URL}/feed.xml`,
    site_url: BLOG_URL,
    language: 'ja',
  });

  const blogs = await getBlogs();

  for (const blog of blogs) {
    const metadata = await getBlogMetadata(blog.slug);
    feed.item({
      title: metadata.title,
      description: metadata.description ?? '',
      url: `${BLOG_URL}/${blog.slug}`,
      date: metadata.updatedAt,
      categories: blog.tags,
      author: 'k8o',
    });
  }

  return new NextResponse(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
