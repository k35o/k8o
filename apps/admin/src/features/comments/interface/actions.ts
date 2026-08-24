'use server';

import { updateTag } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';
import { COMMENTS_CACHE_TAG } from '@/shared/cache/cache-tags';

import { deleteCommentById } from '../infrastructure/comment-repository';

export async function deleteComment(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await deleteCommentById(id);
  } catch {
    return { error: '削除に失敗しました' };
  }

  updateTag(COMMENTS_CACHE_TAG);
  return { success: true };
}
