'use server';

import { revalidatePath } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';

import { updateBlogPublished } from '../infrastructure/blog-repository';

export async function setBlogPublished(
  id: number,
  published: boolean,
): Promise<ActionState> {
  await verifySession();

  try {
    await updateBlogPublished(id, published);
  } catch {
    return { error: '公開状態の更新に失敗しました' };
  }

  revalidatePath('/blogs');
  revalidatePath('/');
  return { success: true };
}
