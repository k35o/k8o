import { cacheLife } from 'next/cache';

import { getComments as _getComments } from '@/features/comments/application/get-comments';

export const getComments = async () => {
  'use cache';
  cacheLife('minutes');

  const items = await _getComments();
  return items;
};

export type { CommentItem } from '@/features/comments/application/get-comments';
