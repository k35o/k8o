'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enrichArticleMetadata } from '@/features/reading-list/application/enrich-articles';
import { syncArticles } from '@/features/reading-list/application/sync-articles';
import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';
import { revalidateMainCache } from '@/shared/cache/revalidate-main';

import {
  deleteArticleById,
  insertArticle,
  refetchArticleOg,
  updateArticleById,
} from '../infrastructure/reading-list-repository';
import {
  parseArticleCreateFormData,
  parseArticleUpdateFormData,
} from './article-form-validation';

export async function deleteArticle(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await deleteArticleById(id);
  } catch {
    return { error: '削除に失敗しました' };
  }

  await revalidateMainCache();
  revalidatePath('/reading-list');
  revalidatePath('/');
  return { success: true };
}

export async function createArticle(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const parsed = parseArticleCreateFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await insertArticle(parsed.data);
  } catch {
    return { error: '記事の作成に失敗しました（URL が重複している可能性）' };
  }

  await revalidateMainCache();
  revalidatePath('/reading-list');
  revalidatePath('/');
  return redirect('/reading-list');
}

export async function updateArticle(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();

  const parsed = parseArticleUpdateFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await updateArticleById(id, parsed.data);
  } catch {
    return { error: '記事の更新に失敗しました' };
  }

  await revalidateMainCache();
  revalidatePath('/reading-list');
  return redirect('/reading-list');
}

export async function refetchArticleMetadata(id: number): Promise<ActionState> {
  await verifySession();

  try {
    const ok = await refetchArticleOg(id);
    if (!ok) {
      return { error: '記事が見つかりませんでした' };
    }
  } catch {
    return { error: 'OGP の再取得に失敗しました' };
  }

  await revalidateMainCache();
  revalidatePath('/reading-list');
  return { success: true };
}

type SyncActionState = ActionState & {
  newArticles?: number;
  updatedArticles?: number;
  enrichedArticles?: number;
  failedSources?: string[];
};

export async function syncArticlesAction(): Promise<SyncActionState> {
  await verifySession();

  try {
    const result = await syncArticles();
    const { enrichedArticles } = await enrichArticleMetadata();
    await revalidateMainCache();
    revalidatePath('/reading-list');
    revalidatePath('/');
    return {
      newArticles: result.newArticles,
      updatedArticles: result.updatedArticles,
      enrichedArticles,
      failedSources: result.failedSources,
    };
  } catch {
    return { error: '記事の同期に失敗しました' };
  }
}
