// getBlogContents() の返値要素と構造一致のローカル型。
// features 層の戻り値に依存せず、blog 一覧 UI が必要とするフィールドだけを表現する。
export type BlogSummary = {
  id: number;
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};
