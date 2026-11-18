import type { BlogSummary } from '@/features/blog/interface/queries';
import { matchesSearchQuery } from '@/shared/search/search-filter';

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
