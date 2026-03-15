'use server';

import { db } from '@repo/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifySession } from '@/libs/verify-session';

type ActionState = {
  error?: string;
};

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

  try {
    new URL(url);
    new URL(siteUrl);
  } catch {
    return { error: '有効なURLを入力してください' };
  }

  try {
    await db.insert(db._schema.articleSources).values({
      title,
      url,
      siteUrl,
      type,
    });
  } catch {
    return { error: 'ソースの作成に失敗しました' };
  }

  revalidatePath('/reading-list');
  redirect('/reading-list');
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

  try {
    new URL(url);
    new URL(siteUrl);
  } catch {
    return { error: '有効なURLを入力してください' };
  }

  try {
    await db
      .update(db._schema.articleSources)
      .set({
        title,
        url,
        siteUrl,
        type,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(db._schema.articleSources.id, id));
  } catch {
    return { error: 'ソースの更新に失敗しました' };
  }

  revalidatePath('/reading-list');
  redirect('/reading-list');
}

export async function deleteSource(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await db
      .delete(db._schema.articleSources)
      .where(eq(db._schema.articleSources.id, id));
  } catch {
    return { error: 'ソースの削除に失敗しました' };
  }

  revalidatePath('/reading-list');
  redirect('/reading-list');
}
