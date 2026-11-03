import { buildRssFeed } from '@repo/helpers/feed/build-rss';

import { getBlogContents } from '@/features/blog/interface/queries';

const BLOG_URL = 'https://k8o.me/blog';

export async function GET(): Promise<Response> {
  const blogs = await getBlogContents();
  const xml = buildRssFeed({
    title: 'k8o Blog',
    description: 'Webフロントエンドを中心に、日々のことも書いています。',
    feedUrl: `${BLOG_URL}/feed`,
    siteUrl: BLOG_URL,
    items: blogs.map((blog) => ({
      title: blog.title,
      description: blog.description ?? '',
      url: `${BLOG_URL}/${blog.slug}`,
      guid: `${BLOG_URL}/${blog.slug}`,
      // pubDate は公開日にする。更新のたびに新着として再浮上させない
      date: blog.createdAt,
      categories: blog.tags,
    })),
  });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
