import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';

import { getBlogContents } from '@/features/blog/interface/queries';
import { buildRssFeed } from '@/shared/feed/build-rss';

import { metadata } from '../layout';

const BLOG_URL = 'https://k8o.me/blog';

async function generateRssFeed() {
  'use cache';
  cacheLife('max');

  const blogs = await getBlogContents();

  return buildRssFeed({
    title: metadata.title,
    description: metadata.description,
    feedUrl: `${BLOG_URL}/feed`,
    siteUrl: BLOG_URL,
    items: blogs.map((blog) => ({
      title: blog.title,
      description: blog.description ?? '',
      url: `${BLOG_URL}/${blog.slug}`,
      date: blog.updatedAt,
      categories: blog.tags,
    })),
  });
}

export async function GET() {
  const xml = await generateRssFeed();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
