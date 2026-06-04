import {
  ARTICLE_SOURCE_TYPES,
  type ArticleSourceInput,
  type ArticleSourceType,
} from '../infrastructure/reading-list-repository';

type ParseResult =
  | { ok: true; data: ArticleSourceInput }
  | { ok: false; error: string };

// FormData の値は string | File | null。文字列以外は空文字に正規化する。
const getStringField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

const isArticleSourceType = (value: string): value is ArticleSourceType =>
  (ARTICLE_SOURCE_TYPES as readonly string[]).includes(value);

// createSource / updateSource が共有するソース入力の検証ロジック。
export const parseSourceFormData = (formData: FormData): ParseResult => {
  const title = getStringField(formData, 'title');
  const url = getStringField(formData, 'url');
  const siteUrl = getStringField(formData, 'siteUrl');
  const type = getStringField(formData, 'type');

  if (!(title && url && siteUrl && type)) {
    return { ok: false, error: '全ての項目を入力してください' };
  }

  if (!isArticleSourceType(type)) {
    return { ok: false, error: 'タイプはfeedまたはmanualを指定してください' };
  }

  if (!URL.canParse(url) || !URL.canParse(siteUrl)) {
    return { ok: false, error: '有効なURLを入力してください' };
  }

  return { ok: true, data: { title, url, siteUrl, type } };
};
