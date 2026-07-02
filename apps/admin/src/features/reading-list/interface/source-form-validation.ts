import { getStringField } from '@repo/helpers/form/get-string-field';

import {
  ARTICLE_SOURCE_TYPES,
  type ArticleSourceInput,
  type ArticleSourceType,
} from '../infrastructure/reading-list-repository';
import { isHttpsUrl } from './url-validation';

type ParseResult =
  | { ok: true; data: ArticleSourceInput }
  | { ok: false; error: string };

const isArticleSourceType = (value: string): value is ArticleSourceType =>
  (ARTICLE_SOURCE_TYPES as readonly string[]).includes(value);

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

  if (!(isHttpsUrl(url) && isHttpsUrl(siteUrl))) {
    return { ok: false, error: '有効なURL(https)を入力してください' };
  }

  return { ok: true, data: { title, url, siteUrl, type } };
};
