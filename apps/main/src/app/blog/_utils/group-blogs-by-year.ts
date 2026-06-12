import type { BlogSummary } from './types';

export type BlogYearGroup = {
  year: number;
  blogs: BlogSummary[];
};

// 一覧を createdAt の年で見出し付きにグルーピングする。
// - 年は降順に並べる
// - グループ内は入力順を保持する（入力が createdAt 降順なので再ソートは不要）
// - フィルタ後の配列を渡す前提のため、空の年グループは生成されない
// - 年は UTC 基準（getUTCFullYear）で判定する。createdAt は UTC で保存されており、
//   ローカルタイムゾーン依存の getFullYear だと年境界（例: 2025-01-01T00:00:00Z）で
//   閲覧者のタイムゾーンによりグループがずれるため
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
