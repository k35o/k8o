import RSS from 'rss';
import { metadata } from '../layout';
import { NextResponse } from 'next/server';
import { db } from '#database/db';

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

  const blogs = await db.query.blogs.findMany({
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });

  for (const blog of blogs) {
    feed.item({
      title: blog.title,
      description: blog.description,
      url: `${BLOG_URL}/${blog.slug}`,
      date: blog.updatedAt,
      categories: blog.blogTag.map((blogTag) => blogTag.tag.name),
      author: 'k8o',
    });
  }

  return new NextResponse(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
