import { isYmdDate } from '@repo/helpers/date/is-ymd-date';
import { getStringField } from '@repo/helpers/form/get-string-field';

import type {
  ArticleInput,
  ArticleUpdateInput,
} from '../infrastructure/reading-list-repository';

// 公開ページで href として描画されるため、javascript: 等を拒否して https に限定する
const isHttpsUrl = (value: string): boolean =>
  URL.canParse(value) && new URL(value).protocol === 'https:';

type CreateResult =
  | { ok: true; data: ArticleInput }
  | { ok: false; error: string };

type UpdateResult =
  | { ok: true; data: ArticleUpdateInput }
  | { ok: false; error: string };

export const parseArticleCreateFormData = (
  formData: FormData,
): CreateResult => {
  const articleSourceId = Number(getStringField(formData, 'articleSourceId'));
  const title = getStringField(formData, 'title');
  const url = getStringField(formData, 'url');
  const publishedAt = getStringField(formData, 'publishedAt');
  const description = getStringField(formData, 'description');

  if (!Number.isInteger(articleSourceId) || articleSourceId <= 0) {
    return { ok: false, error: 'ソースを選択してください' };
  }
  if (!(title && url && publishedAt)) {
    return { ok: false, error: 'タイトル・URL・公開日は必須です' };
  }
  if (!isYmdDate(publishedAt)) {
    return { ok: false, error: '公開日は YYYY-MM-DD 形式で入力してください' };
  }
  if (!isHttpsUrl(url)) {
    return { ok: false, error: '有効なURL(https)を入力してください' };
  }

  return {
    ok: true,
    data: {
      articleSourceId,
      title,
      url,
      publishedAt,
      description: description === '' ? null : description,
    },
  };
};

export const parseArticleUpdateFormData = (
  formData: FormData,
): UpdateResult => {
  const title = getStringField(formData, 'title');
  const url = getStringField(formData, 'url');
  const publishedAt = getStringField(formData, 'publishedAt');
  const description = getStringField(formData, 'description');

  if (!(title && url && publishedAt)) {
    return { ok: false, error: 'タイトル・URL・公開日は必須です' };
  }
  if (!isYmdDate(publishedAt)) {
    return { ok: false, error: '公開日は YYYY-MM-DD 形式で入力してください' };
  }
  if (!isHttpsUrl(url)) {
    return { ok: false, error: '有効なURL(https)を入力してください' };
  }

  return {
    ok: true,
    data: {
      title,
      url,
      publishedAt,
      description: description === '' ? null : description,
    },
  };
};
