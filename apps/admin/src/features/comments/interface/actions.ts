'use server';

import { revalidatePath } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';

import { deleteCommentById } from '../infrastructure/comment-repository';

export async function deleteComment(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await deleteCommentById(id);
  } catch {
    return { error: '削除に失敗しました' };
  }

  revalidatePath('/comments');
  revalidatePath('/');
  return { success: true };
}
