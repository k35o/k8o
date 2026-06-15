import { readFile } from 'node:fs/promises';

import { parseAnnotations } from '@repo/code-highlight/parser';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';

import { blogPath } from './path';

export type BlogOgCode = {
  lang: string;
  code: string;
};

export const getBlogOgCode = async (
  slug: string,
): Promise<BlogOgCode | null> => {
  const content = await readFile(blogPath(slug), 'utf-8');
  const tree = remark().use(remarkFrontmatter).parse(content);

  for (const node of tree.children) {
    if (node.type !== 'code') {
      continue;
    }
    const { code, annotations } = parseAnnotations(node.value);
    const isOgTarget = annotations.some((lineAnnotations) =>
      lineAnnotations.some((annotation) => annotation.type === 'og'),
    );
    if (isOgTarget) {
      return { lang: node.lang ?? 'text', code };
    }
  }

  return null;
};
