import type { BlogSummary } from './types';

// 検索用の正規化。
// NFKC で全角英数・全角スペースなどを半角に揃え、toLowerCase で大文字小文字を吸収する。
// かなの折り畳み（ひらがな⇔カタカナ）は行わない。
export const normalizeForSearch = (text: string): string =>
  text.normalize('NFKC').toLowerCase();

// 一覧をテキスト検索で絞り込む。
// - query を正規化後に空白で分割したトークン間を AND で結合し、
//   各トークンが title / description / いずれかのタグ名のどれかに部分一致すれば通過する
// - query が空（空白のみ含む）のときは全件を返す
// - 非破壊・入力順保持
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
