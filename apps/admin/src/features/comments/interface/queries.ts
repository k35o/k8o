import { cacheLife, cacheTag } from 'next/cache';

import { COMMENTS_CACHE_TAG } from '@/shared/cache/cache-tags';

import {
  findComments,
  findCommentStats,
} from '../infrastructure/comment-repository';
import type {
  CommentRecord,
  CommentStats,
  FindCommentsParams,
  FindCommentsResult,
} from '../infrastructure/comment-repository';

export type CommentItem = CommentRecord;

export const getComments = async (
  params: FindCommentsParams,
): Promise<FindCommentsResult> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(COMMENTS_CACHE_TAG);

  const result = await findComments(params);
  return result;
};

export const getCommentStats = async (): Promise<CommentStats> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(COMMENTS_CACHE_TAG);

  const stats = await findCommentStats();
  return stats;
};

export type {
  CommentStats,
  FindCommentsParams,
} from '../infrastructure/comment-repository';
