import { NextResponse } from 'next/server';
import {
  assistItems,
  assistSection,
  forgeItems,
  forgeSection,
  profile,
} from '@/app/_constants/content';
import { getBlogContents } from '@/app/blog/_api';
import { getTalks } from '@/services/talks/talks';

async function _generateLlmContent() {
  'use cache';

  const [blogs, talks] = await Promise.all([getBlogContents(), getTalks()]);

  const blogContent = blogs
    .map((blog) => {
      if (!blog.description) {
        return `#### ${blog.title}`;
      }
      return `#### ${blog.title}\n${blog.description}`;
    })
    .join('\n\n');

  const talkContent = talks
    .map((talk) => `#### ${talk.title}\n${talk.eventName}（${talk.eventDate}）`)
    .join('\n\n');

  // Blog と Talks はサブアイテムを持つため、個別に組み立てる
  const subItemsMap: Record<string, string> = {
    '/blog': blogContent,
    '/talks': talkContent,
  };

  const forgeContent = forgeItems
    .map((item) => {
      const base = `### ${item.title}\n${item.description}`;
      const subItems = subItemsMap[item.link];
      if (subItems) {
        return `${base}\n\n${subItems}`;
      }
      return base;
    })
    .join('\n\n');

  const assistContent = assistItems
    .map((item) => `### ${item.title}\n${item.description}`)
    .join('\n\n');

  return `# ${profile.name}
${profile.description}

## ${forgeSection.title}
${forgeSection.description}

${forgeContent}

## ${assistSection.title}
${assistSection.description}

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
