import { cacheLife, cacheTag } from 'next/cache';

import {
  getComments as _getComments,
  getCommentStats as _getCommentStats,
} from '@/features/comments/application/get-comments';
import type {
  CommentStats,
  FindCommentsParams,
  FindCommentsResult,
} from '@/features/comments/application/get-comments';
import { COMMENTS_CACHE_TAG } from '@/shared/cache/cache-tags';

export const getComments = async (
  params: FindCommentsParams,
): Promise<FindCommentsResult> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(COMMENTS_CACHE_TAG);

  const result = await _getComments(params);
  return result;
};

export const getCommentStats = async (): Promise<CommentStats> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(COMMENTS_CACHE_TAG);

  const stats = await _getCommentStats();
  return stats;
};

export type {
  CommentItem,
  CommentStats,
  FindCommentsParams,
} from '@/features/comments/application/get-comments';
