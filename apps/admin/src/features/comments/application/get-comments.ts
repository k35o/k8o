import {
  type CommentRecord,
  findComments,
} from '../infrastructure/comment-repository';

export type CommentItem = CommentRecord;

export const getComments = (): Promise<CommentItem[]> => findComments();
