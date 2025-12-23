import { NextResponse } from 'next/server';
import RSS from 'rss';
import { getBlogContents } from '@/app/blog/_api';
import { metadata } from '../layout';

const BLOG_URL = 'https://k8o.me/blog';

async function generateRssFeed() {
  'use cache';

  const feed = new RSS({
    title: metadata.title,
    description: metadata.description,
    feed_url: `${BLOG_URL}/feed.xml`,
    site_url: BLOG_URL,
    language: 'ja',
  });

  const blogs = await getBlogContents();

  for (const blog of blogs) {
    feed.item({
      title: blog.title,
      description: blog.description ?? '',
      url: `${BLOG_URL}/${blog.slug}`,
      date: blog.updatedAt,
      categories: blog.tags.map((tag) => tag),
    });
  }

  return feed.xml();
}

export async function GET() {
  const xml = await generateRssFeed();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
