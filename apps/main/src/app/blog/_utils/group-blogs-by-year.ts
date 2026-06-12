import type { BlogSummary } from './types';

export type BlogYearGroup = {
  year: number;
  blogs: BlogSummary[];
};

// 一覧を createdAt の年で見出し付きにグルーピングする。
// - 年は降順に並べる
// - グループ内は入力順を保持する（入力が createdAt 降順なので再ソートは不要）
// - フィルタ後の配列を渡す前提のため、空の年グループは生成されない
export const groupBlogsByYear = (
  blogs: readonly BlogSummary[],
): BlogYearGroup[] => {
  const groups = new Map<number, BlogSummary[]>();
  for (const blog of blogs) {
    const year = new Date(blog.createdAt).getFullYear();
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
