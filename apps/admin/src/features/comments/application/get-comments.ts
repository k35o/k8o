import {
  type CommentRecord,
  type CommentStats,
  type FindCommentsParams,
  type FindCommentsResult,
  findComments,
  findCommentStats,
} from '../infrastructure/comment-repository';

export type CommentItem = CommentRecord;
export type { CommentStats, FindCommentsParams, FindCommentsResult };

export const getComments = (
  params: FindCommentsParams,
): Promise<FindCommentsResult> => findComments(params);

export const getCommentStats = (): Promise<CommentStats> => findCommentStats();
