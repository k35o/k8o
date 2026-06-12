import { parseAsString } from 'nuqs/server';

// /blog 一覧の検索状態を URL に保持するための nuqs parser 定義。
// - q: テキスト検索クエリ（タイトル・説明・タグ名を対象に部分一致）
export const blogListParsers = {
  q: parseAsString.withDefault(''),
};
