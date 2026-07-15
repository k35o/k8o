'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';
import { revalidateMainCache } from '@/shared/cache/revalidate-main';

import {
  deleteArticleSourceById,
  insertArticleSource,
  updateArticleSource,
} from '../infrastructure/reading-list-repository';
import { parseSourceFormData } from './source-form-validation';

export async function createSource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const parsed = parseSourceFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await insertArticleSource(parsed.data);
  } catch {
    return { error: 'ソースの作成に失敗しました' };
  }

  await revalidateMainCache();
  revalidatePath('/reading-list');
  return redirect('/reading-list');
}

export async function updateSource(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const parsed = parseSourceFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await updateArticleSource(id, parsed.data);
  } catch {
    return { error: 'ソースの更新に失敗しました' };
  }

  await revalidateMainCache();
  revalidatePath('/reading-list');
  return redirect('/reading-list');
}

export async function deleteSource(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await deleteArticleSourceById(id);
  } catch {
    return { error: 'ソースの削除に失敗しました' };
  }

  await revalidateMainCache();
  revalidatePath('/reading-list');
  return redirect('/reading-list');
}
