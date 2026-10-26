import { readFile } from 'node:fs/promises';

import { mdxToMarkdown } from '../application/markdown';
import { blogPath } from '../application/path';

export async function getMarkdown(slug: string) {
  const content = await readFile(blogPath(slug), 'utf-8');
  return mdxToMarkdown(content, slug);
}
