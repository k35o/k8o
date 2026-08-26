'use server';

import { verifySession } from '@repo/auth-shell/verify-session';
import { updateTag } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { TAGS_CACHE_TAG } from '@/shared/cache/cache-tags';
import { revalidateMainCache } from '@/shared/cache/revalidate-main';

import {
  countTagUsage,
  deleteTagById,
  insertTag,
  updateTagName,
} from '../infrastructure/tag-repository';

const getName = (formData: FormData): string => {
  const value = formData.get('name');
  return typeof value === 'string' ? value.trim() : '';
};

export async function createTag(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const name = getName(formData);
  if (name === '') {
    return { error: 'タグ名を入力してください' };
  }

  try {
    await insertTag(name);
  } catch {
    return { error: 'タグの作成に失敗しました（重複の可能性があります）' };
  }

  await revalidateMainCache();
  updateTag(TAGS_CACHE_TAG);
  return { success: true };
}

export async function renameTag(
  id: number,
  name: string,
): Promise<ActionState> {
  await verifySession();

  if (name.trim() === '') {
    return { error: 'タグ名を入力してください' };
  }

  try {
    await updateTagName(id, name.trim());
  } catch {
    return { error: 'タグ名の更新に失敗しました（重複の可能性があります）' };
  }

  await revalidateMainCache();
  updateTag(TAGS_CACHE_TAG);
  return { success: true };
}

export async function deleteTag(id: number): Promise<ActionState> {
  await verifySession();

  const usage = await countTagUsage(id);
  if (usage > 0) {
    return { error: '使用中のタグは削除できません' };
  }

  try {
    await deleteTagById(id);
  } catch {
    return { error: 'タグの削除に失敗しました' };
  }

  await revalidateMainCache();
  updateTag(TAGS_CACHE_TAG);
  return { success: true };
}
