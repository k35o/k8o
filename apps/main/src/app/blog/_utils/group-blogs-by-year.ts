import type { BlogSummary } from './types';

export type BlogYearGroup = {
  year: number;
  blogs: BlogSummary[];
};

// 年は UTC 基準（getUTCFullYear）で判定する。createdAt は UTC で保存されており、
// ローカルタイムゾーン依存の getFullYear だと年境界（例: 2025-01-01T00:00:00Z）で
// 閲覧者のタイムゾーンによりグループがずれるため
export const groupBlogsByYear = (
  blogs: readonly BlogSummary[],
): BlogYearGroup[] => {
  const groups = new Map<number, BlogSummary[]>();
  for (const blog of blogs) {
    const year = new Date(blog.createdAt).getUTCFullYear();
    const existing = groups.get(year);
    if (existing === undefined) {
      groups.set(year, [blog]);
    } else {
      existing.push(blog);
    }
  }

  return [...groups.entries()]
    .toSorted(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, blogs: items }));
};
