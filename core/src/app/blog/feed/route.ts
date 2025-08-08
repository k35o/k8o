import { NextResponse } from 'next/server';
import RSS from 'rss';
import { getBlogContents } from '#api/blog';
import { metadata } from '../layout';

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

  const blogs = await getBlogContents();

  blogs.forEach((blog) => {
    feed.item({
      title: blog.title,
      description: blog.description ?? '',
      url: `${BLOG_URL}/${blog.slug}`,
      date: blog.updatedAt,
      categories: blog.tags.map((tag) => tag),
    });
  });

  return new NextResponse(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
