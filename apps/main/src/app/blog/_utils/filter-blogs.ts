import { matchesSearchQuery } from '@/shared/search/search-filter';

import type { BlogSummary } from './types';

export const filterBlogs = (
  blogs: readonly BlogSummary[],
  query: string,
): BlogSummary[] =>
  blogs.filter((blog) =>
    matchesSearchQuery(query, [
      blog.title,
      blog.description ?? '',
      ...blog.tags,
    ]),
  );
