'use server';

import { verifySession } from '@repo/auth-shell/verify-session';
import { updateTag } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { BLOGS_CACHE_TAG } from '@/shared/cache/cache-tags';
import { revalidateMainCache } from '@/shared/cache/revalidate-main';

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

  await revalidateMainCache();
  updateTag(BLOGS_CACHE_TAG);
  return { success: true };
}
