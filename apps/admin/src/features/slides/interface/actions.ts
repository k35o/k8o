'use server';

import { revalidatePath } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';
import { revalidateMainCache } from '@/shared/cache/revalidate-main';

import { updateSlidePublished } from '../infrastructure/slide-repository';

export async function setSlidePublished(
  id: number,
  published: boolean,
): Promise<ActionState> {
  await verifySession();

  try {
    await updateSlidePublished(id, published);
  } catch {
    return { error: '公開状態の更新に失敗しました' };
  }

  await revalidateMainCache();
  revalidatePath('/slides');
  return { success: true };
}
