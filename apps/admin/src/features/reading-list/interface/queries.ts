import { cacheLife } from 'next/cache';

import {
  findArticleSourceById,
  findReadingListContent,
} from '../infrastructure/reading-list-repository';

export const getReadingListContentData = async () => {
  'use cache';
  cacheLife('minutes');

  const content = await findReadingListContent();
  return content;
};

export const getArticleSourceForEdit = async (id: string) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return null;
  }

  const source = await findArticleSourceById(numericId);
  return source;
};
