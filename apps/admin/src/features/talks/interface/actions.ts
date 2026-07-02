'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';
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
  revalidatePath('/talks');
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
  revalidatePath('/talks');
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
  revalidatePath('/talks');
  return { success: true };
}
