// 一覧の検索・絞り込み・ページングは URL の searchParams で表現する。
// その読み書きを担う純粋関数群（クライアント state を持たない）。

/**
 * 現在の検索文字列に更新を適用して新しいクエリ文字列(先頭 `?` 付き)を返す。
 * value が null または空文字のキーは削除する。
 */
export const buildSearchString = (
  current: string,
  updates: Record<string, string | null>,
): string => {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  const str = params.toString();
  return str === '' ? '' : `?${str}`;
};

/**
 * searchParams の値(string | string[] | undefined)から単一の文字列を取り出す。
 * 配列(同名パラメータ複数)や未指定は undefined。
 */
export const firstParam = (
  value: string | string[] | undefined,
): string | undefined => (typeof value === 'string' ? value : undefined);

/**
 * page パラメータを 1 以上の整数に正規化する。不正値は 1。
 */
export const parsePageParam = (value: string | null | undefined): number => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
};

/**
 * 総件数とページサイズから総ページ数を求める（最低 1）。
 */
export const getTotalPages = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(total / pageSize));
