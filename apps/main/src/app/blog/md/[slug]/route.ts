import { readFile } from 'node:fs/promises';

import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';

import { blogPath } from '@/services/blogs/path';

const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n*/;

async function getMarkdown(slug: string) {
  'use cache';
  cacheLife('max');

  const content = await readFile(blogPath(slug), 'utf-8');
  return content.replace(FRONTMATTER_RE, '');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const markdown = await getMarkdown(slug);
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
