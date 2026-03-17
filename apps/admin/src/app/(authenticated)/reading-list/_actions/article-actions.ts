'use server';

import { db } from '@repo/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/libs/verify-session';
import { syncArticles } from '@/services/reading-list/sync-articles';

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function deleteArticle(id: number): Promise<ActionState> {
  await verifySession();

  try {
    await db.delete(db._schema.articles).where(eq(db._schema.articles.id, id));
  } catch {
    return { error: '削除に失敗しました' };
  }

  revalidatePath('/reading-list');
  revalidatePath('/');
  return { success: true };
}

type SyncActionState = {
  error?: string;
  newArticles?: number;
  updatedArticles?: number;
  failedSources?: string[];
};

export async function syncArticlesAction(): Promise<SyncActionState> {
  await verifySession();

  try {
    const result = await syncArticles();
    revalidatePath('/reading-list');
    revalidatePath('/');
    return {
      newArticles: result.newArticles,
      updatedArticles: result.updatedArticles,
      failedSources: result.failedSources,
    };
  } catch {
    return { error: '記事の同期に失敗しました' };
  }
}
