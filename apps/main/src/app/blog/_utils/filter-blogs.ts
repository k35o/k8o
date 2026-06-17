import type { BlogSummary } from './types';

const normalizeForSearch = (text: string): string =>
  text.normalize('NFKC').toLowerCase();

export const filterBlogs = (
  blogs: readonly BlogSummary[],
  query: string,
): BlogSummary[] => {
  const tokens = normalizeForSearch(query)
    .split(/\s+/u)
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return [...blogs];
  }

  const result: BlogSummary[] = [];
  for (const blog of blogs) {
    const normalizedTitle = normalizeForSearch(blog.title);
    const normalizedDescription =
      blog.description === null ? '' : normalizeForSearch(blog.description);
    const normalizedTags = blog.tags.map((tag) => normalizeForSearch(tag));

    const matchesAllTokens = tokens.every(
      (token) =>
        normalizedTitle.includes(token) ||
        normalizedDescription.includes(token) ||
        normalizedTags.some((tag) => tag.includes(token)),
    );
    if (matchesAllTokens) {
      result.push(blog);
    }
  }

  return result;
};
