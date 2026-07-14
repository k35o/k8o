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
export type {
  CommentStats,
  FindCommentsParams,
  FindCommentsResult,
} from '../infrastructure/comment-repository';

export const getComments = (
  params: FindCommentsParams,
): Promise<FindCommentsResult> => findComments(params);

export const getCommentStats = (): Promise<CommentStats> => findCommentStats();
