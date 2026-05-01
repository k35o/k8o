import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getTalks } from '@/features/talks/interface/queries';
import { assistPageMetadata, pageMetadata } from '@/shared/site/page-metadata';

function _formatMetadataSection(metadata: {
  title?: string | null;
  description?: string | null;
}): string {
  return `### ${metadata.title ?? ''}\n${metadata.description ?? ''}`;
}

async function _generateLlmContent() {
  'use cache';
  cacheLife('max');

  const [blogs, talks] = await Promise.all([getBlogContents(), getTalks()]);

  const blogContent = blogs
    .map((blog) => {
      if (blog.description === null) {
        return `#### ${blog.title}`;
      }
      return `#### ${blog.title}\n${blog.description}`;
    })
    .join('\n\n');

  const talkContent = talks
    .map((talk) => `#### ${talk.title}\n${talk.eventName}（${talk.eventDate}）`)
    .join('\n\n');

  const forgeItems: Array<{
    metadata: { title?: string | null; description?: string | null };
    subContent?: string;
  }> = [
    { metadata: pageMetadata.blog, subContent: blogContent },
    { metadata: pageMetadata.talks, subContent: talkContent },
    { metadata: pageMetadata.playgrounds },
    { metadata: pageMetadata.artifacts },
  ];

  const forgeContent = forgeItems
    .map(({ metadata, subContent }) => {
      const base = _formatMetadataSection(metadata);
      if (subContent !== undefined) {
        return `${base}\n\n${subContent}`;
      }
      return base;
    })
    .join('\n\n');

  const assistContent = assistPageMetadata
    .map((item) => _formatMetadataSection(item))
    .join('\n\n');

  return `# k8o
WebフロントエンドとTypeScriptが好きで、Baselineを追いながらWeb標準の進化を楽しんでいます。
デザインシステムの構築を通じて、デザインとフロントエンドの交差点を探っています。

## Forge
考えたことや作ったものを形にして公開する場。

${forgeContent}

### ArteOdyssey
k8o.meのデザインシステム。コンポーネントやトークンを確認できます。

## Assist
日々の作業や日常で役立つちょっとしたツール群。

${assistContent}
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
