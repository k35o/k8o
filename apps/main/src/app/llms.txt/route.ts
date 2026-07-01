import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getTalks } from '@/features/talks/interface/queries';
import { siteEntries } from '@/shared/site/site-entries';

async function _generateLlmContent() {
  'use cache';
  cacheLife('max');

  const [blogs, talks] = await Promise.all([getBlogContents(), getTalks()]);

  const blogContent = blogs
    .map((blog) => {
      const url = `https://k8o.me/blog/${blog.slug}`;
      const date = new Date(blog.createdAt).toISOString().slice(0, 10);
      const tags = blog.tags.length > 0 ? ` [${blog.tags.join(', ')}]` : '';
      const head =
        blog.description === null
          ? `#### ${blog.title}`
          : `#### ${blog.title}\n${blog.description}`;
      return `${head}\n${url} (${date})${tags}`;
    })
    .join('\n\n');

  const talkContent = talks
    .map((talk) => {
      const links = talk.slideUrl
        ? `${talk.eventUrl}\n${talk.slideUrl}`
        : talk.eventUrl;
      return `#### ${talk.title}\n${talk.eventName}（${talk.eventDate}）\n${links}`;
    })
    .join('\n\n');

  const dynamicContent = new Map<string, string>([
    ['/blog', blogContent],
    ['/talks', talkContent],
  ]);

  const entriesContent = siteEntries
    .map((entry) => {
      const base = `### ${entry.title}\n${entry.description}`;
      const sub = dynamicContent.get(entry.link);
      return sub === undefined ? base : `${base}\n\n${sub}`;
    })
    .join('\n\n');

  return `# k8o
WebフロントエンドとTypeScriptが好きで、Baselineを追いながらWeb標準の進化を楽しんでいます。
デザインシステムの構築を通じて、デザインとフロントエンドの交差点を探っています。

## ページ一覧
${entriesContent}
`;
}

export async function GET() {
  const content = await _generateLlmContent();

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
