import { cacheLife } from 'next/cache';

import {
  getComments as _getComments,
  getCommentStats as _getCommentStats,
} from '@/features/comments/application/get-comments';
import type {
  CommentStats,
  FindCommentsParams,
  FindCommentsResult,
} from '@/features/comments/application/get-comments';

export const getComments = async (
  params: FindCommentsParams,
): Promise<FindCommentsResult> => {
  'use cache';
  cacheLife('minutes');

  const result = await _getComments(params);
  return result;
};

export const getCommentStats = async (): Promise<CommentStats> => {
  'use cache';
  cacheLife('minutes');

  const stats = await _getCommentStats();
  return stats;
};

export type {
  CommentItem,
  CommentStats,
  FindCommentsParams,
} from '@/features/comments/application/get-comments';
