'use server';

import { verifySession } from '@repo/auth-shell/verify-session';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import type { ActionState } from '@/shared/actions/action-state';
import { TALKS_CACHE_TAG } from '@/shared/cache/cache-tags';
import { revalidateMainCache } from '@/shared/cache/revalidate-main';

import {
  deleteTalkById,
  insertTalk,
  updateTalkById,
} from '../infrastructure/talk-repository';
import { parseTalkFormData } from './talk-form-validation';

export async function createTalk(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const parsed = parseTalkFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await insertTalk(parsed.data);
  } catch {
    return { error: 'トークの作成に失敗しました' };
  }

  await revalidateMainCache();
  updateTag(TALKS_CACHE_TAG);
  return redirect('/talks');
}

export async function updateTalk(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const parsed = parseTalkFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await updateTalkById(id, parsed.data);
  } catch {
    return { error: 'トークの更新に失敗しました' };
  }

  await revalidateMainCache();
  updateTag(TALKS_CACHE_TAG);
  return redirect('/talks');
}

export async function deleteTalk(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await deleteTalkById(id);
  } catch {
    return { error: 'トークの削除に失敗しました' };
  }

  await revalidateMainCache();
  updateTag(TALKS_CACHE_TAG);
  return { success: true };
}
