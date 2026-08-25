'use server';

import { verifySession } from '@repo/auth-shell/verify-session';
import { updateTag } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { SLIDES_CACHE_TAG } from '@/shared/cache/cache-tags';
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
  updateTag(SLIDES_CACHE_TAG);
  return { success: true };
}
