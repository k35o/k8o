import type { BlogSort, BlogStatus } from '../infrastructure/blog-repository';

// MCP とオーナー API が受ける、記事ごとの記録の 1 ページの件数の上限
export const BLOG_STATS_PAGE_SIZE_MAX = 50;

export const BLOG_STATUSES = [
  'all',
  'published',
  'draft',
] as const satisfies readonly BlogStatus[];

export const BLOG_SORTS = [
  'recent',
  'views',
] as const satisfies readonly BlogSort[];
