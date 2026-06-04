'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';

import {
  deleteArticleSourceById,
  insertArticleSource,
  updateArticleSource,
} from '../infrastructure/reading-list-repository';

export async function createSource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const siteUrl = formData.get('siteUrl') as string;
  const type = formData.get('type') as string;

  if (!(title && url && siteUrl && type)) {
    return { error: '全ての項目を入力してください' };
  }

  if (type !== 'feed' && type !== 'manual') {
    return { error: 'タイプはfeedまたはmanualを指定してください' };
  }

  if (!URL.canParse(url) || !URL.canParse(siteUrl)) {
    return { error: '有効なURLを入力してください' };
  }

  try {
    await insertArticleSource({ title, url, siteUrl, type });
  } catch {
    return { error: 'ソースの作成に失敗しました' };
  }

  revalidatePath('/reading-list');
  return redirect('/reading-list');
}

export async function updateSource(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const siteUrl = formData.get('siteUrl') as string;
  const type = formData.get('type') as string;

  if (!(title && url && siteUrl && type)) {
    return { error: '全ての項目を入力してください' };
  }

  if (type !== 'feed' && type !== 'manual') {
    return { error: 'タイプはfeedまたはmanualを指定してください' };
  }

  if (!URL.canParse(url) || !URL.canParse(siteUrl)) {
    return { error: '有効なURLを入力してください' };
  }

  try {
    await updateArticleSource(id, { title, url, siteUrl, type });
  } catch {
    return { error: 'ソースの更新に失敗しました' };
  }

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

  revalidatePath('/reading-list');
  return redirect('/reading-list');
}
