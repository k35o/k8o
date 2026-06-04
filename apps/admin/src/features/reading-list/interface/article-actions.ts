'use server';

import { revalidatePath } from 'next/cache';

import { enrichArticleMetadata } from '@/features/reading-list/application/enrich-articles';
import { syncArticles } from '@/features/reading-list/application/sync-articles';
import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';

import { deleteArticleById } from '../infrastructure/reading-list-repository';

export async function deleteArticle(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await deleteArticleById(id);
  } catch {
    return { error: '削除に失敗しました' };
  }

  revalidatePath('/reading-list');
  revalidatePath('/');
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
    // 既存記事のうち OGP 未取得のものを補完する
    const { enrichedArticles } = await enrichArticleMetadata();
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
