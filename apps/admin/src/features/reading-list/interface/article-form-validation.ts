import type {
  ArticleInput,
  ArticleUpdateInput,
} from '../infrastructure/reading-list-repository';

type CreateResult =
  | { ok: true; data: ArticleInput }
  | { ok: false; error: string };

type UpdateResult =
  | { ok: true; data: ArticleUpdateInput }
  | { ok: false; error: string };

const getStringField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

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
  if (!URL.canParse(url)) {
    return { ok: false, error: '有効なURLを入力してください' };
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
  if (!URL.canParse(url)) {
    return { ok: false, error: '有効なURLを入力してください' };
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
