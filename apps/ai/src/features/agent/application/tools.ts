import { tool } from 'ai';
import * as z from 'zod/mini';

import {
  fetchOwnerBlogMarkdown,
  fetchOwnerBlogs,
} from '../infrastructure/owner-api';
import type { OwnerBlog } from '../infrastructure/owner-api';

// api の BLOG_SLUG_PATTERN と同じ値。@repo/api は型しか読めないので複製する
const BLOG_SLUG_PATTERN = /^[a-z0-9-]+$/u;

const MAX_DESCRIPTION_CHARS = 200;
const MAX_MARKDOWN_CHARS = 50_000;

// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
const toChars = (text: string): string[] => Array.from(text);

const shortenDescription = (blog: OwnerBlog): OwnerBlog => {
  const chars = toChars(blog.description);
  if (chars.length <= MAX_DESCRIPTION_CHARS) {
    return blog;
  }
  return {
    ...blog,
    description: `${chars.slice(0, MAX_DESCRIPTION_CHARS).join('')}…`,
  };
};

const truncateMarkdown = (markdown: string): string => {
  const chars = toChars(markdown);
  if (chars.length <= MAX_MARKDOWN_CHARS) {
    return markdown;
  }
  return `${chars.slice(0, MAX_MARKDOWN_CHARS).join('')}\n\n（ここで切り詰めました。全体は ${chars.length} 文字）`;
};

export const agentTools = {
  list_blogs: tool({
    description:
      'k8o.me のブログ記事の一覧（slug・タイトル・説明・タグ・公開日・URL）を返す',
    inputSchema: z.object({}),
    execute: async (
      _input,
      { abortSignal },
    ): Promise<{ items: OwnerBlog[] }> => ({
      items: (await fetchOwnerBlogs(abortSignal)).map(shortenDescription),
    }),
  }),
  read_blog: tool({
    description:
      'k8o.me のブログ記事の本文を markdown で返す。slug は list_blogs で調べる',
    inputSchema: z.object({
      slug: z
        .string()
        .check(z.regex(BLOG_SLUG_PATTERN), z.describe('記事の slug')),
    }),
    execute: async ({ slug }, { abortSignal }): Promise<string> => {
      const markdown = await fetchOwnerBlogMarkdown(slug, abortSignal);
      if (markdown === null) {
        throw new Error(`記事が見つかりません: ${slug}`);
      }
      return truncateMarkdown(markdown);
    },
  }),
};
