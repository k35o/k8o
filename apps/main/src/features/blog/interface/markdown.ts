import { readFile } from 'node:fs/promises';

import { cacheLife } from 'next/cache';

import { mdxToMarkdown } from '../application/markdown';
import { blogPath } from '../application/path';

// パストラバーサル対策: slug をファイルパスに渡す前に厳格に検証する。
// %2F デコードで `../` 脱出を許さないよう、英小文字・数字・ハイフンのみ許可。
const SLUG_RE = /^[a-z0-9-]+$/u;

export async function getMarkdown(slug: string) {
  'use cache';
  cacheLife('max');

  if (!SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }

  const content = await readFile(blogPath(slug), 'utf-8');
  return mdxToMarkdown(content, slug);
}
