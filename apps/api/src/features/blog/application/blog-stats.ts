// MCP とオーナー API が受ける、記事ごとの記録の 1 ページの件数の上限
export const BLOG_STATS_PAGE_SIZE_MAX = 50;

export const BLOG_STATUSES = ['all', 'published', 'draft'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const BLOG_SORTS = ['recent', 'views'] as const;
export type BlogSort = (typeof BLOG_SORTS)[number];
