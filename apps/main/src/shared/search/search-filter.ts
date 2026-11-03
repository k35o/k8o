const normalizeForSearch = (text: string): string =>
  text.normalize('NFKC').toLowerCase();

// クエリを空白区切りのトークンに分け、全トークンが texts のいずれかに部分一致するか判定する。
// 空クエリは常に一致（絞り込みなし）とみなす。NFKC 正規化と小文字化で全角・大文字の揺れを吸収する。
export const matchesSearchQuery = (
  query: string,
  texts: readonly string[],
): boolean => {
  const tokens = normalizeForSearch(query)
    .split(/\s+/u)
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return true;
  }

  const normalizedTexts = texts.map((text) => normalizeForSearch(text));
  return tokens.every((token) =>
    normalizedTexts.some((text) => text.includes(token)),
  );
};
