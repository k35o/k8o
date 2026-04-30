import { readFile } from 'node:fs/promises';
import { cacheLife } from 'next/cache';
import { blogPath } from '../application/path';

const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n*/;

export async function getMarkdown(slug: string) {
  'use cache';
  cacheLife('max');

  const content = await readFile(blogPath(slug), 'utf-8');
  return content.replace(FRONTMATTER_RE, '');
}
