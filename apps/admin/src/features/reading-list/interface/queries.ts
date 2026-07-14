import { cacheLife } from 'next/cache';

import {
  findArticleForEdit,
  findArticles,
  findArticleSourceById,
  findReadingListContent,
} from '../infrastructure/reading-list-repository';
import type { FindArticlesResult } from '../infrastructure/reading-list-repository';

export const getReadingListContentData = async () => {
  'use cache';
  cacheLife('minutes');

  const content = await findReadingListContent();
  return content;
};

export const getArticles = async (params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<FindArticlesResult> => {
  'use cache';
  cacheLife('minutes');

  const result = await findArticles(params);
  return result;
};

export const getArticleSourceForEdit = async (id: string) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return null;
  }

  const source = await findArticleSourceById(numericId);
  return source;
};

export const getArticleForEdit = async (id: string) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return null;
  }

  const article = await findArticleForEdit(numericId);
  return article;
};
